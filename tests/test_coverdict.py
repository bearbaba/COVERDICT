import importlib.util
import json
import hashlib
import pathlib
import sys
import types
from datetime import datetime, timezone
from unittest.mock import patch

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
USER = '0x' + '1' * 40
OTHER = '0x' + '2' * 40
DEPOSIT = '0x' + 'a' * 40
TX = '0x' + 'f' * 64
TX2 = '0x' + 'e' * 64
COMMIT = 'a' * 40
POLICY = 'A valid program covers the direct ETH deposit transactions in the designated incident window following the exploit.'
REPORT = 'Covered exploit: unauthorized withdrawal from the designated affected deposit contract, and the protocol explicitly recognizes these deposits as eligible for a demo reimbursement.'
POLICY_URL = f'https://raw.githubusercontent.com/bearbaba/COVERDICT/{COMMIT}/evidence/policy.txt'
REPORT_URL = f'https://raw.githubusercontent.com/bearbaba/COVERDICT/{COMMIT}/evidence/report.txt'
POLICY_SHA = hashlib.sha256(POLICY.encode()).hexdigest()
REPORT_SHA = hashlib.sha256(REPORT.encode()).hexdigest()
START = 2_000_003_600
END = START + 3600
DEADLINE = END + 7200

class UserError(Exception):
    pass

class FakeU256(int):
    pass

class Map(dict):
    pass

class Return:
    def __init__(self, calldata): self.calldata = calldata

class Sender:
    def __init__(self, wallet): self.as_hex = wallet

class Contract:
    pass

class FakeVM:
    UserError = UserError
    Return = Return
    def __init__(self): self.disagree = False
    def run_nondet_unsafe(self, leader, validator):
        # Catch a subtle GenVM issue: contract self captures TreeMap storage
        # via cloudpickle and triggers warnings in nondeterministic mode.
        for fn in (leader, validator):
            assert 'self' not in fn.__code__.co_freevars
            for cell in fn.__closure__ or ():
                assert not isinstance(cell.cell_contents, Contract), 'Nondet closure captured contract storage'
        decision = leader()
        if self.disagree or not validator(Return(decision)):
            raise UserError('Validators disagreed')
        return decision

class FakeAPI:
    def __init__(self):
        self.sender_address = Sender(USER)

class FakeWeb:
    def __init__(self): self.data = {}
    def get(self, url):
        if url not in self.data: raise KeyError(url)
        return types.SimpleNamespace(body=self.data[url].encode('utf-8'))

class FakeNondet:
    def __init__(self):
        self.web = FakeWeb()
        self.verdict = {'outcome': 'ELIGIBLE', 'reason': 'The documented covered incident applies to this transaction.'}
    def exec_prompt(self, prompt, response_format=None):
        assert response_format == 'json'
        assert 'UNTRUSTED DOCUMENTS' in prompt
        return dict(self.verdict)

@pytest.fixture
def context():
    vm = FakeVM()
    api = FakeAPI()
    nondet = FakeNondet()
    gl = types.SimpleNamespace(Contract=Contract, public=types.SimpleNamespace(write=lambda f:f, view=lambda f:f), message=api, vm=vm, nondet=nondet)
    shim = types.ModuleType('genlayer')
    shim.gl = gl
    shim.u256 = FakeU256
    shim.TreeMap = Map
    with patch.dict(sys.modules, {'genlayer': shim}):
        spec = importlib.util.spec_from_file_location('coverdict_under_test', ROOT / 'contracts/Coverdict.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with patch.object(module, '_now', return_value=START-1000) as clock:
            contract = module.Coverdict()
            contract.programs = Map()
            contract.cases = Map()
            contract.claimed_wallets = Map()
            contract.used_transactions = Map()
            contract.credits = Map()
            contract.create_program('Covered protocol exploit', DEPOSIT, START, END, DEADLINE,
                                    POLICY_URL, POLICY_SHA, 100, 10)
            clock.return_value = END + 1
            contract.attach_report(1, REPORT_URL, REPORT_SHA)
            def receipt(tx=TX, sender=USER, to=DEPOSIT, timestamp=START+400, status='ok', value='100'):
                return {'hash':tx,'from':{'hash':sender},'to':{'hash':to},'timestamp':datetime.fromtimestamp(timestamp, timezone.utc).isoformat().replace('+00:00','Z'),'status':status,'value':value}
            nondet.web.data = {POLICY_URL:POLICY,REPORT_URL:REPORT,
                               module.BLOCKSCOUT + TX:json.dumps(receipt()),
                               module.BLOCKSCOUT + TX2:json.dumps(receipt(tx=TX2,sender=OTHER))}
            yield module, contract, gl, clock, receipt

def test_program_created_and_report_locked(context):
    m,c,gl,clock,_ = context
    assert c.get_program(1)['issuer'] == USER
    assert c.get_program(1)['status'] == 'OPEN_FOR_CLAIMS'
    with pytest.raises(UserError): c.attach_report(1,REPORT_URL,REPORT_SHA)
    assert c.get_program_count() == 1

@pytest.mark.parametrize('url', [
    'https://evil.com/policy.txt',
    'https://raw.githubusercontent.com/bearbaba/COVERDICT/main/evidence/policy.txt',
    POLICY_URL + '?x=1',
    'https://raw.githubusercontent.com/bearbaba/COVERDICT/'+COMMIT+'/evidence/../../README.txt',
    'http://raw.githubusercontent.com/bearbaba/COVERDICT/'+COMMIT+'/evidence/policy.txt',
])
def test_reject_untrusted_policy_urls(context,url):
    m,c,_,clock,_ = context
    clock.return_value = START-1000
    with pytest.raises(UserError):
        c.create_program('A credible coverage test', DEPOSIT, START, END, DEADLINE, url, POLICY_SHA, 10, 1)

@pytest.mark.parametrize('invalid', ['notahash','0xdeadbeef','0x'+'g'*64])
def test_reject_invalid_transaction_ids(context,invalid):
    _,c,_,_,_ = context
    with pytest.raises(UserError): c.submit_claim(1,invalid)

def test_only_issuer_can_attach_report(context):
    m,c,gl,clock,_ = context
    clock.return_value = START-1000
    c.create_program('Another coverage test', DEPOSIT,START, END,DEADLINE,POLICY_URL,POLICY_SHA,10,2)
    clock.return_value = END+1
    gl.message.sender_address.as_hex = OTHER
    with pytest.raises(UserError): c.attach_report(2,REPORT_URL,REPORT_SHA)


def test_claim_owner_and_duplicate_protection(context):
    _,c,gl,_,_ = context
    assert c.submit_claim(1,TX) == 1
    with pytest.raises(UserError): c.submit_claim(1,TX)
    with pytest.raises(UserError): c.submit_claim(1,TX2)
    gl.message.sender_address.as_hex = OTHER
    with pytest.raises(UserError): c.submit_claim(1,TX)
    assert c.get_case(1)['status'] == 'SUBMITTED'


def test_approved_then_one_time_wallet_payout(context):
    m,c,gl,_,_ = context
    case_id=c.submit_claim(1,TX)
    assert c.resolve_claim(case_id)=='APPROVED'
    assert c.get_case(1)['evidence_digest']
    assert c.get_case(1)['award_credits']==100
    gl.message.sender_address.as_hex=OTHER
    with pytest.raises(UserError): c.claim_demo_award(case_id)
    gl.message.sender_address.as_hex=USER
    assert c.claim_demo_award(case_id)==100
    assert c.get_demo_balance(USER)==100
    assert c.get_case(case_id)['claimed']
    with pytest.raises(UserError): c.claim_demo_award(case_id)
    with pytest.raises(UserError): c.resolve_claim(case_id)


def test_receipt_wrong_destination_denied(context):
    m,c,gl,_,receipt = context
    gl.nondet.web.data[m.BLOCKSCOUT+TX]=json.dumps(receipt(to='0x'+'b'*40))
    c.submit_claim(1,TX)
    assert c.resolve_claim(1)=='DENIED'
    assert c.get_case(1)['outcome']=='INELIGIBLE'


def test_receipt_outside_window_denied(context):
    m,c,gl,_,receipt = context
    gl.nondet.web.data[m.BLOCKSCOUT+TX]=json.dumps(receipt(timestamp=START-1))
    c.submit_claim(1,TX)
    assert c.resolve_claim(1)=='DENIED'


def test_failed_receipt_denied(context):
    m,c,gl,_,receipt = context
    gl.nondet.web.data[m.BLOCKSCOUT+TX]=json.dumps(receipt(status='error'))
    c.submit_claim(1,TX)
    assert c.resolve_claim(1)=='DENIED'


def test_missing_evidence_is_not_rejection(context):
    m,c,gl,_,_ = context
    del gl.nondet.web.data[m.BLOCKSCOUT+TX]
    c.submit_claim(1,TX)
    assert c.resolve_claim(1)=='SUBMITTED'
    assert c.get_case(1)['outcome']=='UNVERIFIABLE'
    with pytest.raises(UserError): c.resolve_claim(1)


def test_response_transaction_hash_must_match_request(context):
    m,c,gl,_,receipt = context
    # An API response for a different transaction must not be classified as
    # an ineligible claimant or be passed on to the LLM for approval.
    gl.nondet.web.data[m.BLOCKSCOUT + TX] = json.dumps(receipt(tx=TX2))
    c.submit_claim(1,TX)
    assert c.resolve_claim(1) == 'SUBMITTED'
    assert c.get_case(1)['outcome'] == 'UNVERIFIABLE'
    assert c.get_case(1)['evidence_digest'] == ''


def test_unverifiable_grace_cannot_close_early(context):
    m,c,gl,clock,_=context
    c.submit_claim(1,TX)
    clock.return_value = DEADLINE + m.CLAIM_REVIEW_GRACE - 1
    with pytest.raises(UserError, match='grace period'):
        c.close_unverifiable_claim(1)


def test_unverifiable_grace_closes_without_award(context):
    m,c,gl,clock,_=context
    c.submit_claim(1,TX)
    clock.return_value = DEADLINE + m.CLAIM_REVIEW_GRACE
    assert c.close_unverifiable_claim(1) == 'CLOSED_UNVERIFIABLE'
    assert c.get_case(1)['outcome'] == 'UNVERIFIABLE'
    assert c.get_case(1)['award_credits'] == 0
    assert c.get_demo_balance(USER) == 0
    with pytest.raises(UserError): c.resolve_claim(1)
    with pytest.raises(UserError): c.claim_demo_award(1)
    with pytest.raises(UserError): c.close_unverifiable_claim(1)


def test_expired_review_cannot_late_approve(context):
    m,c,gl,clock,_=context
    c.submit_claim(1,TX)
    clock.return_value = DEADLINE + m.CLAIM_REVIEW_GRACE
    with pytest.raises(UserError, match='grace period has ended'):
        c.resolve_claim(1)
    assert c.get_case(1)['status'] == 'SUBMITTED'


def test_hash_mismatch_is_unverifiable(context):
    m,c,gl,_,_ = context
    gl.nondet.web.data[POLICY_URL]='MUTATED POLICY CONTENT'
    c.submit_claim(1,TX)
    assert c.resolve_claim(1)=='SUBMITTED'
    assert c.get_case(1)['outcome']=='UNVERIFIABLE'


def test_llm_explicit_denial(context):
    m,c,gl,_,_ = context
    gl.nondet.verdict={'outcome':'INELIGIBLE','reason':'The report explicitly excludes the relevant incident from this coverage.'}
    c.submit_claim(1,TX)
    assert c.resolve_claim(1)=='DENIED'
    assert c.get_demo_balance(USER)==0


def test_llm_unknown_stays_open(context):
    m,c,gl,_,_ = context
    gl.nondet.verdict={'outcome':'UNVERIFIABLE','reason':'The documents do not unambiguously establish covered incident causation.'}
    c.submit_claim(1,TX)
    assert c.resolve_claim(1)=='SUBMITTED'


def test_disagreement_rolls_back_state(context):
    m,c,gl,_,_ = context
    c.submit_claim(1,TX)
    gl.vm.disagree=True
    with pytest.raises(UserError): c.resolve_claim(1)
    assert c.get_case(1)['status']=='SUBMITTED'
    assert c.get_case(1)['attempts']==0


def test_future_incident_required(context):
    m,c,gl,clock,_ = context
    clock.return_value=START
    with pytest.raises(UserError):
        c.create_program('Late claim coverage',DEPOSIT,START,END,DEADLINE,POLICY_URL,POLICY_SHA,10,1)


def test_no_real_transfer_method(context):
    m,c,_,_,_ = context
    methods=[x for x in dir(c) if not x.startswith('_')]
    assert all('withdraw' not in x and 'deposit' not in x and 'transfer' not in x for x in methods)


def test_receipt_parser_missing_fields_unverifiable(context):
    m,c,gl,_,_=context
    gl.nondet.web.data[m.BLOCKSCOUT+TX]=json.dumps({'status':'ok'})
    c.submit_claim(1,TX)
    assert c.resolve_claim(1)=='SUBMITTED'
    assert c.get_case(1)['outcome']=='UNVERIFIABLE'


@pytest.mark.parametrize('receipt_override', [
    {'sender': OTHER},
    {'to': OTHER},
    {'timestamp': START - 1},
    {'timestamp': END + 1},
    {'value': '0'},
    {'status': 'error'},
])
def test_ineligible_receipt_never_mints_awards_or_reaches_llm(context, receipt_override):
    """Wrong wallet/destination/time/value/status is deterministically INELIGIBLE."""
    m, c, gl, _, receipt = context
    gl.nondet.web.data[m.BLOCKSCOUT + TX] = json.dumps(receipt(**receipt_override))
    # The LLM must never adjudicate a receipt already failing objective checks.
    def unexpected_prompt(*_args, **_kwargs):
        raise AssertionError('LLM must not run on deterministically mismatched receipt')
    gl.nondet.exec_prompt = unexpected_prompt

    case_id = c.submit_claim(1, TX)
    assert c.resolve_claim(case_id) == 'DENIED'
    case = c.get_case(case_id)
    program = c.get_program(1)
    assert case['outcome'] == 'INELIGIBLE'
    assert case['claimed'] is False
    assert case['award_credits'] == 0
    assert len(case['evidence_digest']) == 64
    assert program['submitted'] == 1
    assert program['approved'] == 0
    assert program['claimed'] == 0
    assert c.get_demo_balance(USER) == 0
    with pytest.raises(UserError, match='No unclaimed approved award'):
        c.claim_demo_award(case_id)


@pytest.mark.parametrize('source_fault', [
    'policy_missing',
    'report_missing',
    'policy_content_changed',
    'report_content_changed',
    'receipt_missing',
    'receipt_invalid_json',
    'receipt_hash_wrong',
    'receipt_missing_timestamp',
    'receipt_wrong_type',
])
def test_unverifiable_source_cannot_be_awarded_or_denied(context, source_fault):
    """Unavailable/inconsistent evidence != proven fraud. Never award or deny silently."""
    m, c, gl, _, receipt = context
    data = gl.nondet.web.data
    if source_fault == 'policy_missing':
        del data[POLICY_URL]
    elif source_fault == 'report_missing':
        del data[REPORT_URL]
    elif source_fault == 'policy_content_changed':
        data[POLICY_URL] = 'Altered policy'
    elif source_fault == 'report_content_changed':
        data[REPORT_URL] = 'Altered report'
    elif source_fault == 'receipt_missing':
        del data[m.BLOCKSCOUT + TX]
    elif source_fault == 'receipt_invalid_json':
        data[m.BLOCKSCOUT + TX] = 'not json'
    elif source_fault == 'receipt_hash_wrong':
        data[m.BLOCKSCOUT + TX] = json.dumps(receipt(tx=TX2))
    elif source_fault == 'receipt_missing_timestamp':
        payload = receipt()
        del payload['timestamp']
        data[m.BLOCKSCOUT + TX] = json.dumps(payload)
    elif source_fault == 'receipt_wrong_type':
        data[m.BLOCKSCOUT + TX] = json.dumps({'hash': TX, 'status': 'ok', 'from': 'invalid'})

    case_id = c.submit_claim(1, TX)
    assert c.resolve_claim(case_id) == 'SUBMITTED'
    case = c.get_case(case_id)
    assert case['outcome'] == 'UNVERIFIABLE'
    assert case['status'] == 'SUBMITTED'
    assert case['evidence_digest'] == ''
    assert case['award_credits'] == 0
    assert c.get_program(1)['approved'] == 0
    assert c.get_demo_balance(USER) == 0
    with pytest.raises(UserError, match='No unclaimed approved award'):
        c.claim_demo_award(case_id)


def test_unverifiable_recovers_after_600_seconds_without_duplicate_credit(context):
    m, c, gl, clock, receipt = context
    del gl.nondet.web.data[m.BLOCKSCOUT + TX]
    case_id = c.submit_claim(1, TX)
    assert c.resolve_claim(case_id) == 'SUBMITTED'
    assert c.get_case(case_id)['attempts'] == 1
    with pytest.raises(UserError, match='Wait before retrying'):
        c.resolve_claim(case_id)

    gl.nondet.web.data[m.BLOCKSCOUT + TX] = json.dumps(receipt())
    clock.return_value = END + 1 + m.RETRY_SECONDS
    assert c.resolve_claim(case_id) == 'APPROVED'
    assert c.get_case(case_id)['attempts'] == 2
    assert c.get_program(1)['approved'] == 1
    assert c.claim_demo_award(case_id) == 100
    assert c.get_demo_balance(USER) == 100
    with pytest.raises(UserError, match='No unclaimed approved award'):
        c.claim_demo_award(case_id)


def test_unverifiable_missing_receipt_keeps_state_and_balance(context):
    """A syntactically valid but absent Sepolia tx must never authorize demo credits."""
    m,c,gl,_,_=context
    no_receipt='0x'+'0'*63+'1'
    assert len(no_receipt)==66
    assert m.BLOCKSCOUT + no_receipt not in gl.nondet.web.data
    case_id=c.submit_claim(1,no_receipt)
    assert c.resolve_claim(case_id)=='SUBMITTED'
    state=c.get_case(case_id)
    assert state['outcome']=='UNVERIFIABLE'
    assert state['evidence_digest']==''
    assert state['attempts']==1
    assert state['claimed'] is False and state['award_credits']==0
    assert c.get_demo_balance(USER)==0
    assert c.get_program(1)['approved']==0
    with pytest.raises(UserError,match='No unclaimed approved award'):
        c.claim_demo_award(case_id)


def test_nondet_assessor_is_module_pure(context):
    """The assessor receives frozen source snapshots; no instance method captures storage."""
    module,contract,gl,_,_=context
    assert callable(module._assess)
    assert not hasattr(contract,'_assess')
    c=contract.submit_claim(1,TX)
    assert contract.resolve_claim(c)=='APPROVED'
    assert contract.get_case(c)['status']=='APPROVED'
