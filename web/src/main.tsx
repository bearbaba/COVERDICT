import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import {Activity,ArrowRight,ArrowUpRight,Check,CheckCircle2,Clock3,ExternalLink,FileCheck2,Fingerprint,Layers,LoaderCircle,LockKeyhole,RefreshCw,Search,Shield,ShieldCheck,Wallet,X} from'lucide-react';
import{address,contractVersion,release,releaseUrl,connectWallet,contractExplorer,inspectFinalizedWrite,read,ready,write,type Program,type CaseRecord,type TxRecord}from'./genlayer';
import'./style.css';

type Tab='programs'|'claims'|'create'|'activity';
const UI_RELEASE=release==='v2.2'?'SECURITY RELEASE · V2.2':'HISTORICAL RELEASE · V2';
type LiveTx = {
 label:string;fn:string;account:string;hash:string;startedAt:number;
 phase:'signing'|'submitted'|'finalized'|'failed'|'unverified';
 status:string;detail:string;programId?:number;
};
// Wallet-local activity is intentionally separate from public chain data.
const STORAGE_PREFIX=`coverdict-testnet-wallet-activity-${release}`;
const storageKey=(wallet:string)=>`${STORAGE_PREFIX}:${wallet.toLowerCase()}`;
const readActivity=(wallet:string):TxRecord[]=>{
 if(!/^0x[0-9a-fA-F]{40}$/.test(wallet))return [];
 try{
  const raw=JSON.parse(localStorage.getItem(storageKey(wallet))||'[]') as unknown;
  return Array.isArray(raw)?raw.filter((record):record is TxRecord=>{
   if(!record||typeof record!=='object')return false;
   const item=record as Partial<TxRecord>;
   return typeof item.hash==='string'&&/^0x[0-9a-fA-F]{64}$/.test(item.hash)
    &&typeof item.label==='string'&&typeof item.at==='number'
    &&['pending','finalized','failed','unverified'].includes(item.status||'');
  }).slice(0,80):[];
 }catch{return []}
};
const addr=(v:string)=>v.length>17?`${v.slice(0,6)}…${v.slice(-4)}`:v;
const when=(n:number)=>new Date(n*1000).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
// HTML datetime-local values are in the visitor's LOCAL timezone. Convert to UTC seconds.
const toUtc=(value:string)=>Math.floor(new Date(value).getTime()/1000);
const datePlaceholder=(offsetMs:number)=>{
 const date=new Date(Date.now()+offsetMs);
 return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
};
const intro='Explore completed on-chain synthetic claim adjudication: a pinned incident policy, a separately signed report, Sepolia transaction evidence and a one-time nonredeemable demo award.';
function App(){
 const[tab,setTab]=useState<Tab>('programs');
 const[claimScope,setClaimScope]=useState<'all'|'mine'>('all');
 const[account,setAccount]=useState('');
 const[programs,setPrograms]=useState<Program[]>([]);
 const[cases,setCases]=useState<CaseRecord[]>([]);
 const[programTotal,setProgramTotal]=useState<number|null>(null);
 const[caseTotal,setCaseTotal]=useState<number|null>(null);
 const[programLimit,setProgramLimit]=useState(30);
 const[caseLimit,setCaseLimit]=useState(30);
 const[credits,setCredits]=useState<number|null>(null);
 const[loading,setLoading]=useState(false);
 const[loaded,setLoaded]=useState(false);
 const[dataError,setDataError]=useState(false);
 const[busy,setBusy]=useState('');
 const[error,setError]=useState('');
 const[notice,setNotice]=useState('');
 const[search,setSearch]=useState('');
 const[sharedProgramId,setSharedProgramId]=useState('');
 const[sharedProgram,setSharedProgram]=useState<Program|null>(null);
 const[lookupBusy,setLookupBusy]=useState(false);
 const[selected,setSelected]=useState<number|null>(null);
 const[claimTx,setClaimTx]=useState('');
 const[reports,setReports]=useState({url:'',sha:''});
 const[create,setCreate]=useState({label:'',contract:'',start:datePlaceholder(86400_000),end:datePlaceholder(2*86400_000),deadline:datePlaceholder(3*86400_000),url:'',sha:'',attestor:'',award:'100',max:'10'});
 // A current program is pinned across navigation and reloads until the user
 // deliberately finishes the workflow. This is a browser UX state only.
 const ACTIVE_PROGRAM_KEY=release==='v2.2'?'coverdict-v22-active-program':'coverdict-v2-active-program';
 const[activeProgramId,setActiveProgramId]=useState<number|null>(()=>{
  try{const id=Number(localStorage.getItem(ACTIVE_PROGRAM_KEY)||'0');return Number.isSafeInteger(id)&&id>0?id:null}
  catch{return null}
 });
 const[activeProgramRemote,setActiveProgramRemote]=useState<Program|null>(null);
 const[focusCase,setFocusCase]=useState<CaseRecord|null>(null);
 const[focusBalance,setFocusBalance]=useState<number|null>(null);
 const[focusReading,setFocusReading]=useState(false);
 const[focusNotice,setFocusNotice]=useState('');
 const[txs,setTxs]=useState<TxRecord[]>([]);
 const[liveTx,setLiveTx]=useState<LiveTx|null>(null);
 const currentWallet=useRef('');
 const selectedProgram=programs.find(p=>p.id===selected)??(sharedProgram?.id===selected?sharedProgram:null);
 // Resolve the active claimant's existing case from on-chain records. If the
 // same program is already full, never offer another submission.
 const selectedClaim=selectedProgram&&account?(
  (focusCase?.program_id===selectedProgram.id&&focusCase.claimant.toLowerCase()===account.toLowerCase()&&['SUBMITTED','APPROVED','CLAIMED'].includes(focusCase.status)?focusCase:null)
   ??cases.find(c=>c.program_id===selectedProgram.id&&c.claimant.toLowerCase()===account.toLowerCase()&&['SUBMITTED','APPROVED','CLAIMED'].includes(c.status))
   ??null
 ):null;
 const activeProgram=programs.find(p=>p.id===activeProgramId)
  ??(sharedProgram?.id===activeProgramId?sharedProgram:null)
  ??(activeProgramRemote?.id===activeProgramId?activeProgramRemote:null);
 const activeClaim=account?(
   (focusCase?.program_id===activeProgramId&&focusCase.claimant.toLowerCase()===account.toLowerCase()&&['SUBMITTED','APPROVED','CLAIMED'].includes(focusCase.status)?focusCase:null)
    ??cases.find(c=>c.program_id===activeProgramId&&c.claimant.toLowerCase()===account.toLowerCase()&&['SUBMITTED','APPROVED','CLAIMED'].includes(c.status))
    ??null
 ):null;
 const verifiedExample=release==='v2'&&cases.find(c=>c.id===1&&c.program_id===2&&c.status==='CLAIMED'&&c.claimed&&c.outcome==='ELIGIBLE'&&c.award_credits===100);
 const verifiedExampleProgram=release==='v2'&&programs.find(p=>p.id===2&&p.report_attested&&p.claimed>=1);
 const v22Approved=release==='v2.2'&&programs.find(p=>p.id===1&&p.approved===1&&p.claimed===1&&p.max_claims===1)&&cases.find(c=>c.id===3&&c.program_id===1&&c.status==='CLAIMED'&&c.claimed);
 const canWrite=ready&&!!account&&!busy;
 const awardCapacityFull=(p:Program)=>release==='v2.2'?p.approved>=p.max_claims:p.submitted>=p.max_claims;
 const remainingCapacity=(p:Program)=>Math.max(0,p.max_claims-(release==='v2.2'?p.approved:p.submitted));
 const pinProgram=(id:number)=>{if(!Number.isSafeInteger(id)||id<1)return;setActiveProgramId(id);};
 useEffect(()=>{
  if(activeProgramId===null){setActiveProgramRemote(null);return}
  try{localStorage.setItem(ACTIVE_PROGRAM_KEY,String(activeProgramId))}catch{/* optional */}
  let active=true;
  void read<Program>('get_program',[activeProgramId]).then(record=>{
   if(active&&record.id===activeProgramId)setActiveProgramRemote(record);
  }).catch(()=>{/* Keep the ID pinned; never manufacture a program status. */});
  return()=>{active=false};
 },[activeProgramId]);
 useEffect(()=>{
  const change=(event:StorageEvent)=>{
   if(event.key!==ACTIVE_PROGRAM_KEY)return;
   const id=Number(event.newValue||'0');
   setActiveProgramId(Number.isSafeInteger(id)&&id>0?id:null);
  };
  window.addEventListener('storage',change);
  return()=>window.removeEventListener('storage',change);
 },[]);
 useEffect(()=>{setFocusCase(null);setFocusBalance(null);setFocusNotice('');setFocusReading(false)},[account,activeProgramId]);
 const finishActiveProgram=()=>{
  if(activeClaim?.status!=='CLAIMED'||!activeClaim.claimed)return;
  try{localStorage.removeItem(ACTIVE_PROGRAM_KEY)}catch{/* optional */}
  setActiveProgramId(null);setSelected(null);setFocusCase(null);setFocusBalance(null);
 };
 const isClaimWindowOpen=(p:Program)=>p.status==='OPEN_FOR_CLAIMS'&&Date.now()/1000<p.claim_deadline;
 const canCancel=(c:CaseRecord)=>release==='v2.2'&&c.status==='SUBMITTED'&&c.outcome==='UNVERIFIABLE'&&c.attempts>0&&!!account&&c.claimant.toLowerCase()===account.toLowerCase();
 const canExpire=(c:CaseRecord)=>release==='v2.2'&&c.status==='SUBMITTED'&&!!c.expires_at&&Date.now()/1000>=c.expires_at;
 const canResolveCase=(record:CaseRecord)=>{
  const program=programs.find(p=>p.id===record.program_id)??(sharedProgram?.id===record.program_id?sharedProgram:null)??(activeProgramRemote?.id===record.program_id?activeProgramRemote:null);
  const now=Date.now()/1000;
  return record.status==='SUBMITTED'&&!!program
   &&(release==='v2'||!record.expires_at||now<record.expires_at)
   &&now < program.claim_deadline+7*86400
   &&(!record.attempts||now>=record.last_attempt_at+600);
 };
 useEffect(()=>{
  currentWallet.current=account;
  setTxs(account?readActivity(account):[]);
  if(!account&&tab==='activity')setTab('programs');
 },[account,tab]);
 const recordActivity=(actor:string,change:(prev:TxRecord[])=>TxRecord[])=>{
  if(!/^0x[0-9a-fA-F]{40}$/.test(actor))return;
  const records=change(readActivity(actor)).slice(0,80);
  try{localStorage.setItem(storageKey(actor),JSON.stringify(records));}catch{/* browser storage may be unavailable */}
  if(currentWallet.current.toLowerCase()===actor.toLowerCase())setTxs(records);
 };
 const refresh=useCallback(async(wallet=account)=>{
  if(!ready)return;
  setLoading(true);
  try{
   const [version,programCount,caseCount]=await Promise.all([read<string>('get_contract_version'),read<number>('get_program_count'),read<number>('get_case_count')]);
   if(version!==contractVersion)throw new Error('Expected COVERDICT '+release+' contract; received an incompatible version.');
   const pCount=Math.max(0,Number(programCount));
   const cCount=Math.max(0,Number(caseCount));
   if(!Number.isSafeInteger(pCount)||!Number.isSafeInteger(cCount))throw new Error('Invalid contract pagination state');
   const pIds=Array.from({length:Math.min(pCount,programLimit)},(_,i)=>pCount-i);
   const cIds=Array.from({length:Math.min(cCount,caseLimit)},(_,i)=>cCount-i);
   const[p,c]=await Promise.all([Promise.all(pIds.map(id=>read<Program>('get_program',[id]))),Promise.all(cIds.map(id=>read<CaseRecord>('get_case',[id])))]);
   setPrograms(p);setCases(c);
   setProgramTotal(pCount);setCaseTotal(cCount);
   setLoaded(true);setDataError(false);
   if(wallet){
    try{
     const balance=Number(await read<number>('get_demo_balance',[wallet]));
     // A delayed read from a previous wallet must not overwrite this wallet's UI.
     if(currentWallet.current.toLowerCase()===wallet.toLowerCase())setCredits(balance);
    }catch(e){
     console.error('Credit read failed',e);
     if(currentWallet.current.toLowerCase()===wallet.toLowerCase())setCredits(null);
    }
   }else if(!currentWallet.current)setCredits(null);
  }catch(e){console.error('Studionet contract read failed',e);setDataError(true)}
  finally{setLoading(false)}
 },[account,programLimit,caseLimit]);
 // When opening the new release for the first time, restore the most
 // recent still-unfinished claim for this connected wallet automatically.
 // Never select another wallet's case and never silently sign anything.
 useEffect(()=>{
  if(activeProgramId!==null||!account||!loaded)return;
  const pending=cases.find(c=>c.claimant.toLowerCase()===account.toLowerCase()
   &&(c.status==='SUBMITTED'||c.status==='APPROVED'));
  if(pending)pinProgram(pending.program_id);
 },[activeProgramId,account,loaded,cases]);
 useEffect(()=>{void refresh()},[refresh]);
 useEffect(()=>{const id=window.setInterval(()=>{if(ready)void refresh()},60000);return()=>clearInterval(id)},[refresh]);
 useEffect(()=>{
  const wallet=window.ethereum;
  if(!wallet?.on)return;
  const accountsChanged=(value:unknown)=>{const a=Array.isArray(value)&&typeof value[0]==='string'?value[0]:'';setAccount(a);setCredits(null)};
  const chainChanged=()=>{setAccount('');setCredits(null);setNotice('Network changed. Reconnect to Studionet.')};
  wallet.on('accountsChanged',accountsChanged);wallet.on('chainChanged',chainChanged);
  return()=>{wallet.removeListener?.('accountsChanged',accountsChanged);wallet.removeListener?.('chainChanged',chainChanged)};
 },[]);
 // Older Studio receipts were erroneously flagged failed because the SDK does
 // not populate txExecutionResultName. Correct local history from real chain data.
 useEffect(()=>{
  if(!account)return;
  let active=true;
  const wrong=readActivity(account).filter(t=>t.status==='failed');
  if(wrong.length){
   void Promise.all(wrong.map(async t=>{
    try{return {hash:t.hash,status:await inspectFinalizedWrite(t.hash)}}catch{return {hash:t.hash,status:'unverified' as const}}
   })).then(results=>{
    if(!active)return;
    const corrected=new Map(results.filter(x=>x.status==='finalized').map(x=>[x.hash,x.status]));
    if(!corrected.size)return;
    const updated=readActivity(account).map(t=>t.status==='failed'&&corrected.has(t.hash)?{...t,status:'finalized' as const}:t);
    try{localStorage.setItem(storageKey(account),JSON.stringify(updated))}catch{/* storage optional */}
    if(currentWallet.current.toLowerCase()===account.toLowerCase())setTxs(updated);
   });
  }
  return()=>{active=false};
 },[account]);
 const doConnect=async()=>{setError('');try{const a=await connectWallet();setAccount(a);await refresh(a);}catch(e){setError(e instanceof Error?e.message:String(e))}};
 const hideWallet=()=>{setAccount('');setCredits(null);setNotice('Wallet hidden locally. Revoke site access in your wallet settings if desired.');};
 // A chain write confirms transaction execution, not the requested verdict.
 // Read the exact claim until its stored status changes before showing an award.
 const verifyCaseAfterFinality=async(fn:string,id:number,actor:string,beforeAttempts:number)=>{
  setFocusReading(true);setFocusNotice('');
  for(let i=0;i<10;i++){
   try{
    const item=await read<CaseRecord>('get_case',[id]);
    if(item.id===id&&item.claimant.toLowerCase()===actor.toLowerCase()){
     const advanced=fn==='resolve_claim'?item.attempts>beforeAttempts
       :fn==='claim_demo_award'?item.status==='CLAIMED'&&item.claimed:fn==='cancel_unverifiable_claim'?item.status==='CANCELLED_UNVERIFIABLE':item.status==='EXPIRED';
     if(advanced){
      let balance:number|null=null;
      if(item.status==='CLAIMED'){
       try{
        const n=Number(await read<number>('get_demo_balance',[actor]));
        if(Number.isSafeInteger(n)&&n>=0)balance=n;
       }catch{/* Do not invent a balance when the read fails. */}
      }
      if(currentWallet.current.toLowerCase()===actor.toLowerCase()){
       setFocusCase(item);setFocusBalance(balance);setFocusReading(false);
       if(fn==='resolve_claim'){
        const positive=item.status==='APPROVED'&&item.outcome==='ELIGIBLE';
        setLiveTx(tx=>tx?.fn==='resolve_claim'&&tx.account.toLowerCase()===actor.toLowerCase()
          ?{...tx,phase:'finalized',
            status:`FINALIZED · VERDICT ${item.outcome||'UNKNOWN'}`,
            detail:positive?'Evidence approved by GenLayer. You may now claim the demo award.'
              :`Consensus execution succeeded but did not approve this claim. ${item.reason} No demo credits were issued.`}:tx);
       }
       setCases(previous=>previous.map(c=>c.id===id?item:c));
       if(fn==='cancel_unverifiable_claim'||fn==='expire_pending_claim')setFocusNotice(`Provisional claim #${id} released. You can now submit fresh evidence if the program remains open.`);
       if(balance!==null)setCredits(balance);
      }
      return;
     }
    }
   }catch{/* RPC final state can lag the transaction receipt. */}
   await new Promise<void>(resolve=>setTimeout(resolve,1250));
  }
  if(currentWallet.current.toLowerCase()===actor.toLowerCase()){
   setFocusReading(false);
   setFocusNotice('Transaction finalized, but the updated claim state is not yet available. Recheck on-chain without signing again.');
  }
 };
 const recheckCurrentCase=async()=>{
  if(!account||!activeClaim||busy||focusReading)return;
  const actor=account,id=activeClaim.id;
  setFocusReading(true);setFocusNotice('');
  try{
   const item=await read<CaseRecord>('get_case',[id]);
   if(item.id!==id||item.claimant.toLowerCase()!==actor.toLowerCase())
    throw new Error('Unexpected claim owner.');
   let balance:number|null=null;
   if(item.status==='CLAIMED'){
    try{
     const n=Number(await read<number>('get_demo_balance',[actor]));
     if(Number.isSafeInteger(n)&&n>=0)balance=n;
    }catch{/* Wallet total remains pending until readable. */}
   }
   if(currentWallet.current.toLowerCase()===actor.toLowerCase()){
    setFocusCase(item);setFocusBalance(balance);
    setCases(previous=>previous.map(c=>c.id===id?item:c));
    if(balance!==null)setCredits(balance);
   }
  }catch{
   if(currentWallet.current.toLowerCase()===actor.toLowerCase())
    setFocusNotice('Studionet could not verify the current claim record. Try Recheck; do not sign the same transaction twice.');
  }finally{if(currentWallet.current.toLowerCase()===actor.toLowerCase())setFocusReading(false)}
 };
 const act=async(label:string,fn:string,args:(string|number)[],complete?:()=>void)=>{
  if(busy)return;
  setError('');setNotice('');setBusy(label);
  let hash='';
  const actor=account;
  const caseId=(['resolve_claim','claim_demo_award','cancel_unverifiable_claim','expire_pending_claim'].includes(fn))?Number(args[0]):null;
  const previousAttempts=caseId===null?0:(cases.find(c=>c.id===caseId)?.attempts??focusCase?.attempts??0);
  if(caseId!==null&&Number.isSafeInteger(caseId)&&caseId>0){
   const item=cases.find(c=>c.id===caseId);
   if(item)pinProgram(item.program_id);
   setFocusCase(null);setFocusBalance(null);setFocusNotice('');
  }
  const startedAt=Date.now();
  setLiveTx({label,fn,account:actor,hash:'',startedAt,phase:'signing',status:'AWAITING WALLET SIGNATURE',detail:'Review this action in MetaMask. The transaction has not been broadcast.'});
  try{
   await write(fn,args,actor,
    h=>{
     hash=h;
     recordActivity(actor,prev=>[{hash:h,label,at:Date.now(),status:'pending'},...prev]);
     setLiveTx(t=>t?.account===actor?{...t,hash:h,phase:'submitted',status:'PENDING',detail:'Signed and submitted. Watching actual GenLayer consensus and finality.'}:t);
    },
    status=>setLiveTx(t=>t?.account===actor?{...t,phase:'submitted',status,detail:'Reading live status from GenLayer Studionet. No second signature is needed.'}:t),
   );
   // Show the confirmed result immediately; slower reads/UI refresh come after.
   recordActivity(actor,prev=>prev.map(t=>t.hash===hash?{...t,status:'finalized'}:t));
   setLiveTx(t=>t?.account===actor?{...t,phase:'finalized',status:'FINALIZED · GENVM SUCCESS',
    detail:'Execution verified on-chain. No need to submit or sign again.'}:t);
   if(fn==='create_program'){
    try{
     const id=Number(await read<number>('get_program_count'));
     const program=await read<Program>('get_program',[id]);
     if(program.label===String(args[0])&&program.issuer.toLowerCase()===actor.toLowerCase()&&program.policy_sha256===args[6]){
      setLiveTx(t=>t?.account===actor?{...t,programId:id,detail:`Program #${id} verified in on-chain storage. Ready for the incident window.`}:t);
     }
    }catch{/* The transaction success is independent from optional detail reads. */}
   }
   // Resolve and award need an immediate, verified RESULT on this same screen.
   // Do not navigate away or ask for another wallet signature.
   if(caseId!==null&&Number.isSafeInteger(caseId)&&caseId>0)
    await verifyCaseAfterFinality(fn,caseId,actor,previousAttempts);
   await refresh(actor);
   complete?.();
  }catch(e){
   const message=e instanceof Error?e.message:String(e);
   if(hash){
    const failed=message.includes('GenVM execution failed');
    recordActivity(actor,prev=>prev.map(t=>t.hash===hash?{...t,status:failed?'failed':'unverified'}:t));
    setLiveTx(t=>t?.account===actor?{...t,phase:failed?'failed':'unverified',
      status:failed?'GENVM EXECUTION FAILED':'VERIFICATION INCOMPLETE',
      detail:message}:t);
   }else{
    setLiveTx(t=>t?.account===actor?{...t,phase:'unverified',status:'NOT BROADCAST',detail:message}:t);
   }
  }finally{setBusy('')}
 };
 const recheckLiveTx=async()=>{
  if(!liveTx?.hash||busy)return;
  const active=liveTx;
  setBusy('Checking transaction');
  setLiveTx(t=>t?.hash===active.hash?{...t,phase:'submitted',status:'VERIFYING ON-CHAIN',detail:'Read-only check. No wallet signature required.'}:t);
  try{
   const status=await inspectFinalizedWrite(active.hash);
   setLiveTx(t=>t?.hash===active.hash?{...t,phase:status==='finalized'?'finalized':status==='failed'?'failed':'unverified',
    status:status==='finalized'?'FINALIZED · GENVM SUCCESS':status==='failed'?'GENVM EXECUTION FAILED':'VERIFICATION INCOMPLETE',
    detail:status==='finalized'?'On-chain execution confirmed.':status==='failed'?'GenVM execution was not successful.':'Check Explorer before submitting another transaction.'}:t);
   if(status!=='unverified')recordActivity(active.account,prev=>prev.map(x=>x.hash===active.hash?{...x,status}:x));
   if(status==='finalized')await refresh(active.account);
  }catch(e){setLiveTx(t=>t?.hash===active.hash?{...t,phase:'unverified',status:'RPC UNAVAILABLE',detail:e instanceof Error?e.message:String(e)}:t)}
  finally{setBusy('')}
 };
 const shownCases=claimScope==='all'?cases:cases.filter(c=>account&&c.claimant.toLowerCase()===account.toLowerCase());
 // Personal workspace: only the connected issuer's programs appear in its list.
 // Public chain records remain available by explicit ID (and Explorer), not broadcast
 // as a feed of unrelated wallets' work.
 const ownPrograms=useMemo(()=>account?programs.filter(p=>p.issuer.toLowerCase()===account.toLowerCase()):[],[programs,account]);
 const shown=useMemo(()=>ownPrograms.filter(p=>p.label.toLowerCase().includes(search.toLowerCase())||String(p.id)===search),[ownPrograms,search]);
 const sendClaim=(event:React.FormEvent)=>{
  event.preventDefault();
  if(!selectedProgram)return;
  if(!isClaimWindowOpen(selectedProgram)){setError('The claim submission deadline has passed.');return}
   if(awardCapacityFull(selectedProgram)){setError('Verified award capacity is full. No new claim can be accepted.');return}
  if(!/^0x[0-9a-fA-F]{64}$/.test(claimTx.trim())){setError('Enter a valid 32-byte Sepolia transaction hash.');return}
  void act('Submit incident claim','submit_claim',[selectedProgram.id,claimTx.trim()],()=>setClaimTx(''));
 };
 const sendProgram=(event:React.FormEvent)=>{
  event.preventDefault();const start=toUtc(create.start),end=toUtc(create.end),deadline=toUtc(create.deadline);
  if([start,end,deadline].some(x=>!Number.isSafeInteger(x))){setError('Invalid local date or time.');return}
  if(!/^0x[0-9a-fA-F]{40}$/.test(create.contract.trim())||!/^0x[0-9a-fA-F]{40}$/.test(create.attestor.trim())||create.attestor.toLowerCase()===account.toLowerCase()||create.attestor.toLowerCase()===create.contract.toLowerCase()||!/^https:\/\/raw\.githubusercontent\.com\/bearbaba\/COVERDICT\/[0-9a-f]{40}\/evidence\/[a-zA-Z0-9_/-]+\.txt$/.test(create.url.trim())||!/^([0-9a-f]{64})$/.test(create.sha.trim())){
   setError('Use a valid Sepolia recipient, a SHA256-pinned policy URL in this repository, and a lowercase 64-character SHA256 digest.');return;
  }
  if(start<Math.floor(Date.now()/1000)+16*60||!(start<end&&end<deadline)||deadline>Date.now()/1000+30*86400){
   setError('Choose a future incident start at least 16 minutes from now, with start < end < deadline, all within 30 days.');return;
  }
  void act('Create reimbursement program','create_program',[create.label.trim(),create.contract.trim(),start,end,deadline,create.url.trim(),create.sha.trim(),Number(create.award),Number(create.max),create.attestor.trim()]);
 };
 const openProgram=(id:number)=>{pinProgram(id);setSelected(id);setReports({url:'',sha:''});setClaimTx('')};
 const lookupProgram=async()=>{
  const id=Number(sharedProgramId.trim());
  if(!/^\d+$/.test(sharedProgramId.trim())||!Number.isSafeInteger(id)||id<1){
   setError('Enter a valid Program ID.');return;
  }
  if(programTotal!==null&&id>programTotal){setError('Unknown Program ID on Studionet.');return}
  if(programs.some(p=>p.id===id)){setError('');openProgram(id);return}
  setLookupBusy(true);setError('');
  try{
   const record=await read<Program>('get_program',[id]);
   if(record.id!==id)throw new Error('Unexpected Program ID returned by the contract.');
   setSharedProgram(record);openProgram(id);
  }catch{setError('Unable to open that Program ID from Studionet. Verify the ID or retry.')}
  finally{setLookupBusy(false)}
 };
 useEffect(()=>{
  const fromLink=new URLSearchParams(window.location.search).get('program');
  if(!fromLink||!/^\d+$/.test(fromLink))return;
  setSharedProgramId(fromLink);
  const id=Number(fromLink);
  if(!Number.isSafeInteger(id)||id<1)return;
  let active=true;
  void read<Program>('get_program',[id]).then(program=>{
   if(active&&program.id===id){setSharedProgram(program);openProgram(id);}
  }).catch(()=>{/* Invalid or unavailable shared program stays unopened. */});
  return()=>{active=false};
 },[]);
 return <div className={`shell ${liveTx?"has-tx-monitor":""}`}>
  <header className="topbar"><div className="container top-inner"><button className="logo" onClick={()=>{setSelected(null);setTab('programs')}}><span className="logo-symbol"><ShieldCheck size={21}/></span><strong>COVER<span>DICT</span></strong><small>{release.toUpperCase()} TESTNET</small><span className="release-marker">{UI_RELEASE}</span></button><nav className="nav"><button className={tab==='programs'?'active':''} onClick={()=>{setSelected(null);setTab('programs')}}>Programs</button><button className={tab==='claims'?'active':''} onClick={()=>{setSelected(null);setClaimScope('all');setTab('claims')}}>Public Claims</button><button className={tab==='create'?'active':''} onClick={()=>{setSelected(null);setTab('create')}}>Create Program</button>{account&&<button className={tab==='activity'?'active':''} onClick={()=>{setSelected(null);setTab('activity')}}>My Activity</button>}</nav><div className="release-switch" aria-label="Choose contract release"><a className={release==='v2.2'?'release-active':''} href={releaseUrl('v2.2',1)}>V2.2 Live</a><a className={release==='v2'?'release-active':''} href={releaseUrl('v2',5)}>V2 Archive</a></div><div className="wallet-actions"><span className="net"><i/> Studionet</span><button className="btn border" title={account?'Hide wallet from this app (does not revoke permissions)':'Connect wallet'} onClick={()=>account?hideWallet():void doConnect()}><Wallet size={16}/>{account?addr(account)+' · Hide':'Connect wallet'}</button></div></div></header>
  <main className="container main">
   {!ready&&<section className="warning"><LockKeyhole size={20}/><div><strong>Contract not configured</strong><p>Check the configured COVERDICT {release} Studionet address at build time. We never display fabricated contract data.</p></div></section>}
   {error&&<section className="error compact-error" role="alert"><X size={16}/><span>{error}</span><button onClick={()=>setError('')}><X size={16}/></button></section>}
   {notice&&<section className="success" role="status"><Check size={18}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={16}/></button></section>}
   {tab!=='create'&&liveTx&&<aside className={`tx-monitor tx-monitor-${liveTx.phase}`} aria-label="Live on-chain transaction" role="status" aria-live="polite">
    <div className="tx-monitor-heading"><span><span className="tx-monitor-dot"/> LIVE TRANSACTION</span>
     {(!busy||liveTx.phase==='finalized')&&<button className="tx-monitor-close" title="Dismiss transaction details" aria-label="Dismiss transaction details" onClick={()=>setLiveTx(null)}><X size={16}/></button>}
    </div>
    <div className="tx-monitor-hero">
     {liveTx.phase==='signing'||liveTx.phase==='submitted'
       ?<LoaderCircle className="tx-monitor-spinner" size={29}/>
       :liveTx.phase==='finalized'?<CheckCircle2 size={30} className="tx-monitor-check"/>
       :<Clock3 size={30} className="tx-monitor-warn"/>}
     <div><small>{liveTx.phase==='signing'?'SIGN IN WALLET':liveTx.phase==='submitted'?'CONSENSUS IN PROGRESS':liveTx.phase==='finalized'?'EXECUTION CONFIRMED':'NEEDS VERIFICATION'}</small><h3>{liveTx.label}</h3></div>
    </div>
    <div className="tx-monitor-result"><span>ON-CHAIN STATUS</span><strong>{liveTx.status}</strong><p>{liveTx.detail}</p></div>
    <div className="tx-monitor-steps">
     <div className={liveTx.hash?'done':'active'}><Check size={13}/> {liveTx.hash?'Signed & submitted':'Waiting for wallet signature'}</div>
     <div className={liveTx.phase==='finalized'?'done':liveTx.phase==='submitted'?'active':''}><Check size={13}/> {liveTx.phase==='finalized'?'GenVM success verified':'Consensus & finality'}</div>
    </div>
    {liveTx.programId!==undefined&&<div className="tx-monitor-program">
      <span>CREATED PROGRAM</span><strong>#{String(liveTx.programId).padStart(3,'0')}</strong>
      <button onClick={()=>{setSelected(liveTx.programId!);setTab('programs')}}>View program <ArrowRight size={14}/></button>
     </div>}
    <div className="tx-monitor-meta"><span>WALLET</span><code>{addr(liveTx.account)}</code><span>CONTRACT</span><code>{addr(address)}</code></div>
    {liveTx.hash&&<a className="tx-monitor-explorer" href={contractExplorer(liveTx.hash)} target="_blank" rel="noreferrer">
     <span>{addr(liveTx.hash)} · Open GenLayer Explorer</span><ExternalLink size={15}/>
    </a>}
    {(liveTx.phase==='unverified'||liveTx.phase==='failed')&&liveTx.hash&&
      <button type="button" className="tx-monitor-recheck" disabled={!!busy} onClick={()=>void recheckLiveTx()}>Recheck on-chain (no signature) <RefreshCw size={14}/></button>}
    <small className="tx-monitor-foot">Studionet 61999 · Synthetic testnet only</small>
   </aside>}
   {activeProgramId!==null&&<section className={`active-workflow ${liveTx&&tab!=='create'?'active-workflow-with-monitor':''} ${activeClaim?.status==='CLAIMED'&&activeClaim.claimed?'active-workflow-complete':''}`} aria-label="Current pinned program and claim result">
    <div className="active-workflow-top">
     <div><span className="active-workflow-kicker"><span className="tx-monitor-dot"/> CURRENT WORKSPACE · PROGRAM #{String(activeProgramId).padStart(3,'0')}</span>
      <h2>{activeProgram?.label??`Program #${activeProgramId}`}</h2>
      <p>{activeProgram?activeProgram.status.replaceAll('_',' '):'Loading program status from Studionet'} · Pinned on this browser until the claim is completed. No need to enter the Program ID again.</p>
     </div>
     <button className="btn border" onClick={()=>{setTab('programs');setSelected(activeProgramId)}} disabled={!activeProgram}>Program details <ArrowUpRight size={15}/></button>
    </div>
    <div className="active-workflow-steps">
     <div className={activeProgram?.report_attested?'step-done':''}><CheckCircle2 size={16}/><span>Incident report</span><strong>{activeProgram?.report_attested?'ATTESTED':'WAITING'}</strong></div>
     <div className={activeClaim?'step-done':''}><CheckCircle2 size={16}/><span>Claim</span><strong>{activeClaim?'#'+String(activeClaim.id).padStart(3,'0'):'NOT FOUND FOR THIS WALLET'}</strong></div>
     <div className={activeClaim?.outcome==='ELIGIBLE'?'step-done':''}><CheckCircle2 size={16}/><span>AI consensus</span><strong>{activeClaim?.outcome||'NOT RESOLVED'}</strong></div>
     <div className={activeClaim?.status==='CLAIMED'?'step-done':''}><CheckCircle2 size={16}/><span>Demo award</span><strong>{activeClaim?.status==='CLAIMED'?'CLAIMED':'NOT CLAIMED'}</strong></div>
    </div>
    {activeClaim&&<div className={`active-workflow-result ${activeClaim.outcome==='UNVERIFIABLE'?'active-workflow-result-unverifiable':activeClaim.outcome==='INELIGIBLE'?'active-workflow-result-denied':activeClaim.outcome==='ELIGIBLE'?'active-workflow-result-eligible':'active-workflow-result-pending'}`} role="status" aria-live="polite">
     {activeClaim.status==='CLAIMED'&&activeClaim.claimed&&activeClaim.outcome==='ELIGIBLE'
      ?<><div className="result-emblem"><CheckCircle2 size={30}/></div><div className="result-copy"><span className="result-eyebrow">FINAL ON-CHAIN RESULT · PROGRAM #{String(activeProgramId).padStart(3,'0')} · CLAIM #{String(activeClaim.id).padStart(3,'0')}</span><h3>CLAIMED · Demo award received</h3><p>The case is marked CLAIMED on GenLayer. This is a non-transferable, non-redeemable testnet credit, not an insurance payout.</p></div><div className="result-totals"><div><small>THIS CLAIM</small><strong>+{activeClaim.award_credits}</strong><span>demo credits</span></div><div><small>WALLET TOTAL</small><strong>{focusCase?.status==='CLAIMED'?(focusBalance??'—'):(credits??'—')}</strong><span>{focusCase?.status==='CLAIMED'&&focusBalance===null?'Balance verification pending':'on-chain demo credits'}</span></div></div></>
      :<><div className="result-emblem pending"><FileCheck2 size={25}/></div><div className="result-copy"><span className="result-eyebrow">CASE #{String(activeClaim.id).padStart(3,'0')} · GENLAYER ON-CHAIN STATUS</span><h3>{activeClaim.status==='APPROVED'&&activeClaim.outcome==='ELIGIBLE'?'APPROVED · ELIGIBLE':activeClaim.outcome==='INELIGIBLE'?'INELIGIBLE · NOT AWARDED':activeClaim.outcome==='UNVERIFIABLE'?'UNVERIFIABLE · Evidence incomplete':'Claim submitted · Awaiting AI review'}</h3><p>{activeClaim.reason||'Consensus has not assessed this case yet. The recorded Sepolia receipt is available for verification.'}</p>
      {activeClaim.outcome==='UNVERIFIABLE'&&<p className="result-retry-note">No award has been approved. The contract allows another independent review only after a 10-minute cooldown. This is not a guarantee of approval or a remedy for missing evidence.</p>}
      </div></>}
    </div>}
    {focusReading&&<p className="active-workflow-checking"><LoaderCircle className="tx-monitor-spinner" size={16}/> Reading the updated case and wallet balance from Studionet…</p>}
    {focusNotice&&<p className="active-workflow-warning">{focusNotice}</p>}
    <div className="active-workflow-actions">
      {activeClaim?.status==='SUBMITTED'&&activeClaim.outcome==='UNVERIFIABLE'&&activeClaim.attempts>0&&!canResolveCase(activeClaim)&&<span className="result-cooldown">Review cooldown until {when(activeClaim.last_attempt_at+600)} · Do not submit duplicate claims</span>}
      {activeClaim?.status==='SUBMITTED'&&canResolveCase(activeClaim)&&<button className="btn primary" disabled={!canWrite||focusReading} onClick={()=>void act('Resolve claim','resolve_claim',[activeClaim.id])}>{activeClaim.outcome==='UNVERIFIABLE'?'Retry evidence review':'Run independent consensus'} <ArrowRight size={16}/></button>}
      {activeClaim&&canCancel(activeClaim)&&<button className="btn border" disabled={!canWrite||focusReading} onClick={()=>void act('Cancel inconclusive claim','cancel_unverifiable_claim',[activeClaim.id])}>Cancel provisional claim <X size={14}/></button>}
       {activeClaim&&canExpire(activeClaim)&&<button className="btn border" disabled={!canWrite||focusReading} onClick={()=>void act('Release expired claim','expire_pending_claim',[activeClaim.id])}>Release expired claim <Clock3 size={14}/></button>}
       {activeClaim?.status==='APPROVED'&&activeClaim.outcome==='ELIGIBLE'&&!activeClaim.claimed&&<button className="btn primary" disabled={!canWrite||focusReading} onClick={()=>void act('Claim demo award','claim_demo_award',[activeClaim.id])}>Claim {activeClaim.award_credits} demo credits <Check size={16}/></button>}
      {activeClaim&&<button className="btn border" disabled={focusReading||!!busy} onClick={()=>void recheckCurrentCase()}><RefreshCw size={15}/> Recheck on-chain</button>}
      {activeClaim?.status==='CLAIMED'&&activeClaim.claimed&&<button className="btn border" onClick={finishActiveProgram}>Finish workspace <CheckCircle2 size={15}/></button>}
      {!activeClaim&&account&&<button className="btn border" onClick={()=>{setTab('claims');setClaimScope('mine')}}>Find my claim <ArrowRight size={15}/></button>}
    </div>
   </section>}
   {tab==='programs'&&<>
    <section className="hero"><div><div className="eyebrow"><span className="dot"/> COVERDICT {release.toUpperCase()} · GENLAYER FULL CONSENSUS</div><h1>Evidence in.<br/><em>Consensus out.</em></h1><p>{intro}</p><div className="actions"><button className="btn primary" onClick={()=>document.getElementById('program-list')?.scrollIntoView({behavior:'smooth'})}>{account?'My programs':'Open programs'} <ArrowRight size={16}/></button><button className="btn border" onClick={()=>{setClaimScope('mine');setTab('claims')}}>My claims</button><a className="btn border" href="https://github.com/bearbaba/COVERDICT" target="_blank" rel="noreferrer">Read the source <ExternalLink size={16}/></a></div></div><div className="hero-art"><div className="halo"><Shield size={66} strokeWidth={1.25}/></div><div className="float-tag"><Fingerprint size={15}/> EVIDENCE-BOUND</div><div className="float-tag bottom"><FileCheck2 size={15}/> PUBLIC CLAIM STATES</div></div></section>
    {verifiedExample&&verifiedExampleProgram&&<section className="verified-demo" aria-label="Completed on-chain acceptance case"><div className="verified-demo-heading"><span className="verified-kicker"><CheckCircle2 size={16}/> ON-CHAIN ACCEPTANCE · OCTOBER 22, 2026</span><span className="pill claimed">COMPLETED</span></div><div className="verified-demo-grid"><div><span>PROGRAM</span><strong>#002</strong></div><div><span>CONSENSUS</span><strong>ELIGIBLE</strong></div><div><span>CLAIM</span><strong>CLAIMED</strong></div><div><span>DEMO AWARD</span><strong>100</strong></div></div><p>Live Studionet state confirms a pinned synthetic report, authorized attestor signature and one-time demo-credit claim. No money, insurance or actual economic loss is involved.</p><div className="verified-links"><button className="btn border" onClick={()=>{setSelected(2);setTab('programs')}}>Inspect Program #2 <ArrowUpRight size={14}/></button><button className="btn border" onClick={()=>{setClaimScope('all');setTab('claims')}}>View Claim #1 <ArrowUpRight size={14}/></button><a className="btn border" href="https://explorer-studio.genlayer.com/tx/0xa38a935a081667c9d88d5692a84cdfc426eda164df0e7788e2c567bcfb275ad7" target="_blank" rel="noreferrer">AI Consensus proof <ExternalLink size={14}/></a></div></section>}
    {release==='v2.2'&&<section className="verified-demo v22-live-panel" aria-label="V2.2 security acceptance">
      <div className="verified-demo-heading"><span className="verified-kicker"><ShieldCheck size={16}/> V2.2 · TESTNET SECURITY RELEASE</span><span className={v22Approved?'pill claimed':'pill'}>{v22Approved?'LIVE STATE VERIFIED':'INSPECT LIVE PROOF'}</span></div>
      <div className="verified-demo-grid"><div><span>PROGRAM</span><strong>#001</strong></div><div><span>ATTACKER</span><strong>DENIED</strong></div><div><span>RIGHTFUL CLAIM</span><strong>{v22Approved?'CLAIMED':'VERIFY ON-CHAIN'}</strong></div><div><span>AWARD</span><strong>{v22Approved?'100':'—'}</strong></div></div>
      <p>New contract with provisional, recoverable claims. An attacker cannot consume verified award capacity or preempt a receipt merely by submitting first. The verified badge appears only when this browser reads the approved and claimed result from Studionet.</p>
      <div className="verified-links"><button className="btn border" onClick={()=>openProgram(1)}>Open Program #001 <ArrowUpRight size={14}/></button><a className="btn border" href="https://explorer-studio.genlayer.com/address/0x65F96FB47380996Aa672b1eC1de8DF95451eC150" target="_blank" rel="noreferrer">New Contract <ExternalLink size={14}/></a><a className="btn border" href="https://github.com/bearbaba/COVERDICT/blob/main/V2_2_FINAL_LIVE_RESULT_20261024.md" target="_blank" rel="noreferrer">Verified TX Evidence <ExternalLink size={14}/></a></div>
     </section>}
    <section className="personal-overview" aria-label="Wallet-specific workspace">
     <div><Wallet size={20}/><strong>{account?'My programs':'Your wallet workspace'}</strong><p>{account?`Showing programs created by ${addr(account)} only. Other wallets' programs are not listed here.`:'Connect a wallet to view the programs you created. Public evidence is available through explicit links.'}</p></div>
     <span className="personal-overview-count">{account?ownPrograms.length:'—'} <small>MY PROGRAMS · LOADED</small></span>
    </section>
    <div id="program-list" className="section-title">
     <div><div className="eyebrow">WALLET-SPECIFIC PROGRAMS</div><h2>My programs</h2></div>
     {account&&<div className="lookup"><Search size={16}/><input placeholder="Search my programs" value={search} onChange={e=>setSearch(e.target.value)}/><button aria-label="Refresh" title="Refresh" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={16}/></button></div>}
    </div>
    {dataError&&<div className="data-status" role="status"><span>Studionet is temporarily unavailable. Existing on-chain data has not been cleared.</span><button className="btn border" onClick={()=>void refresh()} disabled={loading}>Retry</button></div>}
    {!account?<div className="empty personal-empty"><Wallet size={30}/><h3>Connect your wallet</h3><p>Only programs issued by the connected wallet appear in your personal list. Nothing here is a private on-chain record.</p><button className="btn primary" onClick={()=>void doConnect()}>Connect wallet <ArrowRight size={15}/></button></div>
     :loading&&!loaded?<div className="data-status">Loading your on-chain programs…</div>
     :!dataError&&shown.length===0?<div className="empty personal-empty"><Layers size={32}/><h3>{search?'No matching programs':'No programs created by this wallet'}</h3><p>Use Create Program to publish a synthetic testnet program. Programs created by other wallets never appear in this personal list.</p></div>
     :<div className="cards">{shown.map(p=><button key={p.id} className="program-card" onClick={()=>openProgram(p.id)}><div className="card-top"><span className="tiny">MY PROGRAM #{p.id.toString().padStart(3,'0')}</span><span className="pill">{p.status.replaceAll('_',' ')}</span></div><h3>{p.label}</h3><p><span>Sepolia demo recipient</span><code>{addr(p.deposit_contract)}</code></p><div className="card-footer"><span><Clock3 size={14}/> Claims close {when(p.claim_deadline)}</span><strong>{p.award_credits} demo credits <ArrowUpRight size={16}/></strong></div></button>)}</div>}
    {account&&programTotal!==null&&programTotal>programs.length&&<div className="load-more"><span>Loaded {programs.length} recent chain records to find yours. Older programs may exist.</span><button className="btn border" disabled={loading} onClick={()=>setProgramLimit(n=>n+30)}>Find older programs <ArrowRight size={14}/></button></div>}
    <section className="program-lookup" aria-label="Open a specific shared program">
      <div><div className="eyebrow">SHARED PROGRAM ACCESS</div><h3>Have a Program ID?</h3><p>Open a specific testnet program to inspect its evidence or submit a claim. We don't list unrelated wallets' programs in your workspace.</p></div>
      <form onSubmit={e=>{e.preventDefault();void lookupProgram()}} className="program-lookup-form">
       <input aria-label="Program ID" inputMode="numeric" pattern="[0-9]+" placeholder="Program ID e.g. 4" value={sharedProgramId} onChange={e=>setSharedProgramId(e.target.value)} required/>
       <button type="submit" className="btn border" disabled={lookupBusy}>{lookupBusy?'Opening…':'Open program'} <ArrowRight size={14}/></button>
      </form>
      <small>Programs and claims are public on-chain. This changes discovery in the interface, not blockchain visibility.</small>
    </section>
   </>}
   {tab==='claims'&&<>{dataError&&<div className="data-status"><span>Unable to refresh claims from Studionet.</span><button className="btn border" onClick={()=>void refresh()} disabled={loading}>Retry</button></div>}<div className="section-title"><div><div className="eyebrow">PUBLIC ON-CHAIN CLAIM HISTORY</div><h2>{claimScope==='all'?'Public claims':'My claims'}</h2></div><div className="claim-scope"><button className={claimScope==='all'?'active':''} onClick={()=>setClaimScope('all')}>All claims</button><button className={claimScope==='mine'?'active':''} onClick={()=>setClaimScope('mine')}>My claims</button><button className="btn border" onClick={()=>void refresh()}><RefreshCw size={15}/> Refresh</button></div></div>{claimScope==='mine'&&account&&<div className="wallet-summary"><div className="wallet-summary-identity"><Wallet size={18}/><div><span>CONNECTED WALLET</span><strong>{addr(account)}</strong></div></div><div className="wallet-summary-balance"><span>MY DEMO CREDITS</span><strong>{credits??'—'}</strong></div></div>}{claimScope==='mine'&&!account?<div className="empty"><Wallet size={30}/><h3>Connect your wallet</h3><p>To filter claims belonging to your address, connect the claimant wallet. You can still view public claims without connecting.</p></div>:shownCases.length===0?<div className="empty"><FileCheck2 size={30}/><h3>No matching claims in the loaded history</h3><p>Browse a program to submit a Sepolia testnet receipt. If older claims exist, use Load older claims below to fetch them.</p></div>:<div className="claims">{shownCases.map(c=><article className="case" key={c.id}><div className="card-top"><span className="tiny">CLAIM #{c.id.toString().padStart(3,'0')} · PROGRAM #{c.program_id}</span><span className={`pill ${c.status.toLowerCase()}`}>{c.status}</span></div><h3>{c.outcome||'Awaiting review'}</h3><p>{c.reason||'Submitted. Consensus has not yet assessed the evidence.'}</p><details className="claim-proof"><summary>View claim evidence and rules</summary><p><strong>Evidence fingerprint:</strong> <code>{c.evidence_digest||'Not yet verified'}</code></p><p><strong>On-chain claimant (public):</strong> <code>{claimScope==='all'?addr(c.claimant):c.claimant}</code></p><p>Eligibility is based on the issuer's pinned synthetic terms and public testnet receipt, not actual DeFi loss.</p>{programs.find(p=>p.id===c.program_id)&&<a href={programs.find(p=>p.id===c.program_id)!.policy_url} target="_blank" rel="noreferrer">Read pinned policy <ExternalLink size={13}/></a>}</details><a href={`https://eth-sepolia.blockscout.com/tx/${c.tx_hash}`} target="_blank" rel="noreferrer">View Sepolia testnet receipt <ExternalLink size={14}/></a><div className="case-actions">{c.status==='SUBMITTED'&&<button className="btn primary" disabled={!canWrite||!canResolveCase(c)} onClick={()=>void act('Resolve claim','resolve_claim',[c.id])}>{c.outcome==='UNVERIFIABLE'?'Retry evidence review':'Run independent consensus'} <ArrowRight size={16}/></button>}{c.status==='SUBMITTED'&&c.outcome==='UNVERIFIABLE'&&<small className="case-info">Evidence could not be verified. No award was issued. V2.2 permits cancellation or an expired provisional claim to be released.</small>}{canCancel(c)&&<button className="btn border" disabled={!canWrite} onClick={()=>void act('Cancel inconclusive claim','cancel_unverifiable_claim',[c.id])}>Cancel pending claim <X size={14}/></button>}{canExpire(c)&&account.toLowerCase()===c.claimant.toLowerCase()&&<button className="btn border" disabled={!canWrite} onClick={()=>void act('Release expired claim','expire_pending_claim',[c.id])}>Release expired claim <Clock3 size={14}/></button>}{c.status==='APPROVED'&&!c.claimed&&account.toLowerCase()===c.claimant.toLowerCase()&&<button className="btn primary" disabled={!canWrite} onClick={()=>void act('Claim demo award','claim_demo_award',[c.id])}>Claim {c.award_credits} demo credits <Check size={16}/></button>}{c.status==='CLAIMED'&&<span className="verified"><CheckCircle2 size={16}/> Award claimed once</span>}</div></article>)}</div>}{caseTotal!==null&&caseTotal>cases.length&&<div className="load-more"><span>Scanned {cases.length} of {caseTotal} total claims. Older wallet claims may not be loaded.</span><button className="btn border" disabled={loading} onClick={()=>setCaseLimit(n=>n+30)}>Load older claims <ArrowRight size={14}/></button></div>}</>}
   {tab==='create'&&<><div className="eyebrow">ADVANCED · ISSUER-DEFINED DEMO PROGRAM</div><h2>Create a program</h2><p className="lead">Advanced issuer workflow. This creates a testnet simulation, not insurance. Anyone may publish a program; issuer claims are not independently endorsed. A pinned policy and a designated independent signer address must exist before the incident window begins.</p><p className="field-note">All times below use your device's local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}). COVERDICT converts them to UTC timestamps before submission. Incident start must be at least 16 minutes in the future.</p><div className="create-workspace"><form className="form-card" onSubmit={sendProgram}><label>Program label<input value={create.label} onChange={e=>setCreate(v=>({...v,label:e.target.value}))} placeholder="Simulated vault coverage · Example protocol" required minLength={8}/></label><label>Sepolia address receiving the test transaction<input value={create.contract} onChange={e=>setCreate(v=>({...v,contract:e.target.value}))} placeholder="0x..." required/></label><label>Designated report attestor wallet<input value={create.attestor} onChange={e=>setCreate(v=>({...v,attestor:e.target.value}))} placeholder="0x... distinct from issuer and recipient" required pattern="0x[0-9a-fA-F]{40}"/></label><div className="columns"><label>Incident window start (local time)<input type="datetime-local" value={create.start} onChange={e=>setCreate(v=>({...v,start:e.target.value}))} required/></label><label>Incident window end (local time)<input type="datetime-local" value={create.end} onChange={e=>setCreate(v=>({...v,end:e.target.value}))} required/></label></div><label>Claim deadline (local time)<input type="datetime-local" value={create.deadline} onChange={e=>setCreate(v=>({...v,deadline:e.target.value}))} required/></label><label>Immutable policy raw URL<input value={create.url} onChange={e=>setCreate(v=>({...v,url:e.target.value}))} placeholder="https://raw.githubusercontent.com/bearbaba/COVERDICT/<40-char-commit>/evidence/policy.txt" required/></label><label>SHA-256 hash of policy bytes<input value={create.sha} onChange={e=>setCreate(v=>({...v,sha:e.target.value}))} placeholder="64 lowercase hexadecimal characters" required/></label><div className="columns"><label>Demo credits per eligible claim<input type="number" min="1" max="10000" value={create.award} onChange={e=>setCreate(v=>({...v,award:e.target.value}))}/></label><label>Maximum claims<input type="number" min="1" max="20" value={create.max} onChange={e=>setCreate(v=>({...v,max:e.target.value}))}/></label></div><button className="btn primary wide" disabled={!canWrite}>{busy||'Create on-chain program'} <ArrowRight size={16}/></button>{liveTx?.fn==='create_program'&&<section className={`create-inline-result create-inline-${liveTx.phase}`} aria-label="Create program status">
 <div>{liveTx.phase==='signing'||liveTx.phase==='submitted'?<LoaderCircle size={17} className="tx-monitor-spinner"/>:liveTx.phase==='finalized'?<CheckCircle2 size={17}/>:<Clock3 size={17}/>}
 <strong>{liveTx.status}</strong></div>
 <p>{liveTx.detail}</p>
 {liveTx.programId!==undefined&&<b>PROGRAM #{String(liveTx.programId).padStart(3,'0')}</b>}
 {liveTx.hash&&<a href={contractExplorer(liveTx.hash)} target="_blank" rel="noreferrer">Open Explorer <ExternalLink size={13}/></a>}
 </section>}</form>
 <div className="create-side-rail">
  {liveTx?<aside className={`tx-monitor tx-monitor-${liveTx.phase}`} aria-label="Live on-chain transaction" role="status" aria-live="polite">
    <div className="tx-monitor-heading"><span><span className="tx-monitor-dot"/> LIVE TRANSACTION</span>
     {(!busy||liveTx.phase==='finalized')&&<button className="tx-monitor-close" title="Dismiss transaction details" aria-label="Dismiss transaction details" onClick={()=>setLiveTx(null)}><X size={16}/></button>}
    </div>
    <div className="tx-monitor-hero">
     {liveTx.phase==='signing'||liveTx.phase==='submitted'
       ?<LoaderCircle className="tx-monitor-spinner" size={29}/>
       :liveTx.phase==='finalized'?<CheckCircle2 size={30} className="tx-monitor-check"/>
       :<Clock3 size={30} className="tx-monitor-warn"/>}
     <div><small>{liveTx.phase==='signing'?'SIGN IN WALLET':liveTx.phase==='submitted'?'CONSENSUS IN PROGRESS':liveTx.phase==='finalized'?'EXECUTION CONFIRMED':'NEEDS VERIFICATION'}</small><h3>{liveTx.label}</h3></div>
    </div>
    <div className="tx-monitor-result"><span>ON-CHAIN STATUS</span><strong>{liveTx.status}</strong><p>{liveTx.detail}</p></div>
    <div className="tx-monitor-steps">
     <div className={liveTx.hash?'done':'active'}><Check size={13}/> {liveTx.hash?'Signed & submitted':'Waiting for wallet signature'}</div>
     <div className={liveTx.phase==='finalized'?'done':liveTx.phase==='submitted'?'active':''}><Check size={13}/> {liveTx.phase==='finalized'?'GenVM success verified':'Consensus & finality'}</div>
    </div>
    {liveTx.programId!==undefined&&<div className="tx-monitor-program">
      <span>CREATED PROGRAM</span><strong>#{String(liveTx.programId).padStart(3,'0')}</strong>
      <button onClick={()=>{setSelected(liveTx.programId!);setTab('programs')}}>View program <ArrowRight size={14}/></button>
     </div>}
    <div className="tx-monitor-meta"><span>WALLET</span><code>{addr(liveTx.account)}</code><span>CONTRACT</span><code>{addr(address)}</code></div>
    {liveTx.hash&&<a className="tx-monitor-explorer" href={contractExplorer(liveTx.hash)} target="_blank" rel="noreferrer">
     <span>{addr(liveTx.hash)} · Open GenLayer Explorer</span><ExternalLink size={15}/>
    </a>}
    {(liveTx.phase==='unverified'||liveTx.phase==='failed')&&liveTx.hash&&
      <button type="button" className="tx-monitor-recheck" disabled={!!busy} onClick={()=>void recheckLiveTx()}>Recheck on-chain (no signature) <RefreshCw size={14}/></button>}
    <small className="tx-monitor-foot">Studionet 61999 · Synthetic testnet only</small>
   </aside>:
  <section className="tx-standby" aria-label="Transaction monitor standby">
   <div className="tx-standby-kicker"><span className="tx-monitor-dot"/> LIVE TRANSACTION MONITOR</div>
   <div className="tx-standby-icon"><ShieldCheck size={29}/></div>
   <h3>Wallet activity, in real time.</h3>
   <p>When you create a program, this panel tracks wallet approval, GenLayer consensus, verified execution and the resulting Program ID.</p>
   <div className="tx-standby-sequence"><span>1. Wallet signature</span><span>2. Consensus & finality</span><span>3. Verified result</span></div>
   <small>{release.toUpperCase()} TESTNET · {UI_RELEASE}</small>
  </section>}
 </div></div></>}
   {tab==='activity'&&account&&<><div className="eyebrow">CURRENT WALLET · LOCAL HISTORY</div><h2>My Activity</h2><p className="lead">Only transactions initiated in this browser by {addr(account)} appear here. History is stored locally per wallet, not synchronized across browsers or shared as a public activity feed.</p>{txs.length===0?<div className="empty"><Activity size={30}/><h3>No activity stored for this wallet</h3><p>Older unassigned browser history is intentionally not mixed into this wallet. Public on-chain claims remain accessible in Public Claims.</p></div>:<div className="activity">{txs.map(t=><a href={contractExplorer(t.hash)} key={t.hash} target="_blank" rel="noreferrer"><div><strong>{t.label}</strong><small>{addr(t.hash)} · {new Date(t.at).toLocaleString()}</small></div><span className={`pill ${t.status}`}>{t.status}</span><ExternalLink size={15}/></a>)}</div>}</>}
  </main>
  <footer className="footer"><div className="container"><div><ShieldCheck size={16}/> COVERDICT <span>· TESTNET EXPERIMENT · NON-REDEEMABLE DEMO CREDITS</span></div><div>Contract: {ready?addr(address):'Not configured'} · <a href="https://github.com/bearbaba/COVERDICT/blob/main/SECURITY.md" target="_blank" rel="noreferrer">Security & limitations</a></div></div></footer>
  {selectedProgram&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><aside className="drawer" role="dialog" aria-modal="true" aria-label={`Program ${selectedProgram.id}`}><div className="drawer-header"><div className="eyebrow">PROGRAM #{selectedProgram.id} · ISSUER-DEFINED</div><button className="icon" onClick={()=>setSelected(null)} aria-label="Close program"><X size={20}/></button></div><h2>{selectedProgram.label}</h2><span className="pill">{selectedProgram.status.replaceAll('_',' ')}</span><section><h4>Incident window</h4><p>{when(selectedProgram.incident_start)} – {when(selectedProgram.incident_end)}</p><h4>Claim submission closes</h4><p>{when(selectedProgram.claim_deadline)}</p><h4>Evidence boundaries</h4><p><strong>Attestor:</strong> <code className="wordbreak">{selectedProgram.attestor}</code> · {selectedProgram.report_attested?'Report hash signed on-chain':'Signature not recorded'}</p><p>Issuer: <code className="wordbreak">{selectedProgram.issuer}</code> · Not independently endorsed.</p><p>Direct test-ETH transaction on Ethereum Sepolia to the designated recipient. A successful transfer verifies a payment, <strong>not financial loss, coverage or exploit causality</strong>.</p><code className="wordbreak">{selectedProgram.deposit_contract}</code><div className="links"><a href={selectedProgram.policy_url} target="_blank" rel="noreferrer">Pinned policy <ExternalLink size={14}/></a>{selectedProgram.report_url&&<a href={selectedProgram.report_url} target="_blank" rel="noreferrer">Pinned incident report <ExternalLink size={14}/></a>}</div><div className="muted">Submitted attempts: {selectedProgram.submitted} · Verified awards: {selectedProgram.approved}/{selectedProgram.max_claims} · Remaining: {remainingCapacity(selectedProgram)} · Claimed: {selectedProgram.claimed} · Award: {selectedProgram.award_credits} demo credits</div></section>{selectedClaim&&<div className="drawer-form drawer-claim-progress" aria-label="Your existing claim">
  <h4>Your existing claim · #{String(selectedClaim.id).padStart(3,'0')}</h4>
  <p>This wallet has an active or awarded claim. Unverifiable provisional V2.2 claims can be cancelled before submitting fresh evidence.</p>
  <div className="drawer-claim-verdict"><span>ON-CHAIN STATUS</span><strong>{selectedClaim.status} {selectedClaim.outcome?'/ '+selectedClaim.outcome:''}</strong></div>
  {selectedClaim.reason&&<p>{selectedClaim.reason}</p>}
  <div className="drawer-claim-actions">
   {selectedClaim.status==='SUBMITTED'&&canResolveCase(selectedClaim)&&<button className="btn primary wide" disabled={!canWrite||focusReading} onClick={()=>void act('Resolve claim','resolve_claim',[selectedClaim.id])}>Run independent consensus <ArrowRight size={16}/></button>}
   {canCancel(selectedClaim)&&<button className="btn border wide" disabled={!canWrite||focusReading} onClick={()=>void act('Cancel inconclusive claim','cancel_unverifiable_claim',[selectedClaim.id])}>Cancel inconclusive claim <X size={14}/></button>}
    {canExpire(selectedClaim)&&<button className="btn border wide" disabled={!canWrite||focusReading} onClick={()=>void act('Release expired claim','expire_pending_claim',[selectedClaim.id])}>Release expired claim <Clock3 size={14}/></button>}
    {selectedClaim.status==='APPROVED'&&selectedClaim.outcome==='ELIGIBLE'&&!selectedClaim.claimed&&<button className="btn primary wide" disabled={!canWrite||focusReading} onClick={()=>void act('Claim demo award','claim_demo_award',[selectedClaim.id])}>Claim {selectedClaim.award_credits} demo credits <Check size={16}/></button>}
   {selectedClaim.status==='CLAIMED'&&selectedClaim.claimed&&<div className="drawer-award-confirmed" role="status">
    <CheckCircle2 size={25}/>
    <div><strong>CLAIMED · +{selectedClaim.award_credits} demo credits</strong>
     <small>Wallet total: {focusCase?.status==='CLAIMED'?(focusBalance??'Verification pending'):(credits??'Verification pending')} demo credits</small>
     <small>Verified synthetic testnet award. No funds transferred.</small>
    </div>
   </div>}
   <button className="btn border wide" disabled={focusReading||!!busy} onClick={()=>void recheckCurrentCase()}><RefreshCw size={15}/> Recheck on-chain</button>
   {selectedClaim.status==='CLAIMED'&&selectedClaim.claimed&&<button className="btn border wide" onClick={finishActiveProgram}>Finish workspace <CheckCircle2 size={16}/></button>}
  </div>
 </div>}
 {selectedProgram.status==='OPEN_FOR_CLAIMS'&&!selectedClaim&&awardCapacityFull(selectedProgram)&&<div className="drawer-form">
  <h4>Claim capacity reached</h4>
  <p>All {selectedProgram.max_claims} verified award slots are allocated. No additional transaction should be submitted.</p>
  <button className="btn border wide" onClick={()=>{setSelected(null);setClaimScope('mine');setTab('claims')}}>Inspect my existing claim <ArrowRight size={16}/></button>
 </div>}
 {isClaimWindowOpen(selectedProgram)&&!awardCapacityFull(selectedProgram)&&!selectedClaim&&<form className="drawer-form" onSubmit={sendClaim}><h4>Submit a claim</h4><p>Your connected wallet must be the sender of the Sepolia testnet transaction. Only one active provisional claim per wallet and program is allowed. A cancelled or expired claim can be replaced.</p><input value={claimTx} onChange={e=>setClaimTx(e.target.value)} placeholder="0x... Sepolia testnet transaction hash" required/><button className="btn primary wide" disabled={!canWrite}>{busy||'Submit claim'} <ArrowRight size={16}/></button></form>}{selectedProgram.status==='OPEN_FOR_CLAIMS'&&!isClaimWindowOpen(selectedProgram)&&<div className="drawer-form"><h4>Claim submission closed</h4><p>The program claim deadline has passed. Existing claims remain available in My Claims.</p></div>}{selectedProgram.status==='AWAITING_INCIDENT_REPORT'&&account.toLowerCase()===selectedProgram.issuer&&<form className="drawer-form" onSubmit={e=>{e.preventDefault();void act('Attach incident report','attach_report',[selectedProgram.id,reports.url.trim(),reports.sha.trim()],()=>setReports({url:'',sha:''}))}}><h4>Issuer · Attach immutable incident report</h4><p>Only permitted after the incident window ends. Report cannot be replaced.</p><input value={reports.url} onChange={e=>setReports(v=>({...v,url:e.target.value}))} placeholder="Pinned GitHub evidence URL" required/><input value={reports.sha} onChange={e=>setReports(v=>({...v,sha:e.target.value}))} placeholder="SHA256 of report bytes" required/><button className="btn primary wide" disabled={!canWrite}>{busy||'Pin incident report'}</button></form>}{selectedProgram.status==='AWAITING_ATTESTATION'&&account.toLowerCase()===selectedProgram.attestor&&<div className="drawer-form"><h4>Attestor · Confirm pinned incident report</h4><p>Review the linked report and compare the exact SHA-256 before endorsing. This is a synthetic document sign-off, not a finding of real financial loss.</p><code className="wordbreak">{selectedProgram.report_sha256}</code><button className="btn primary wide" disabled={!canWrite||!selectedProgram.report_url||!selectedProgram.report_sha256} onClick={()=>void act('Attest report hash','attest_report',[selectedProgram.id,selectedProgram.report_sha256])}>{busy||'Sign exact report SHA-256'}</button></div>}</aside></div>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
