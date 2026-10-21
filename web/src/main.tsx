import React,{useCallback,useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import {Activity,ArrowRight,ArrowUpRight,Check,CheckCircle2,Clock3,ExternalLink,FileCheck2,Fingerprint,Layers,LockKeyhole,RefreshCw,Search,Shield,ShieldCheck,Wallet,X} from'lucide-react';
import{address,connectWallet,contractExplorer,read,ready,write,type Program,type CaseRecord,type TxRecord}from'./genlayer';
import'./style.css';

type Tab='programs'|'claims'|'create'|'activity';
const STORAGE='coverdict-testnet-transactions';
const addr=(v:string)=>v.length>17?`${v.slice(0,6)}…${v.slice(-4)}`:v;
const when=(n:number)=>new Date(n*1000).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
const toUtc=(value:string)=>Math.floor(Date.parse(`${value}Z`)/1000);
const datePlaceholder=(offsetMs:number)=>new Date(Date.now()+offsetMs).toISOString().slice(0,16);
const intro='Verify a narrowly defined claim against an immutable policy, a recorded Ethereum transaction, and independent GenLayer AI consensus.';
function App(){
 const[tab,setTab]=useState<Tab>('programs');
 const[account,setAccount]=useState('');
 const[programs,setPrograms]=useState<Program[]>([]);
 const[cases,setCases]=useState<CaseRecord[]>([]);
 const[credits,setCredits]=useState<number|null>(null);
 const[loading,setLoading]=useState(false);
 const[busy,setBusy]=useState('');
 const[error,setError]=useState('');
 const[notice,setNotice]=useState('');
 const[search,setSearch]=useState('');
 const[selected,setSelected]=useState<number|null>(null);
 const[claimTx,setClaimTx]=useState('');
 const[reports,setReports]=useState({url:'',sha:''});
 const[create,setCreate]=useState({label:'',contract:'',start:datePlaceholder(86400_000),end:datePlaceholder(2*86400_000),deadline:datePlaceholder(3*86400_000),url:'',sha:'',award:'100',max:'10'});
 const[txs,setTxs]=useState<TxRecord[]>(()=>{try{return JSON.parse(localStorage.getItem(STORAGE)??'[]') as TxRecord[]}catch{return []}});
 const selectedProgram=programs.find(p=>p.id===selected)??null;
 const canWrite=ready&&!!account&&!busy;
 useEffect(()=>{localStorage.setItem(STORAGE,JSON.stringify(txs.slice(0,80)))},[txs]);
 const refresh=useCallback(async(wallet=account)=>{
  if(!ready)return;
  setLoading(true);
  try{
   const [programCount,caseCount]=await Promise.all([read<number>('get_program_count'),read<number>('get_case_count')]);
   const pIds=Array.from({length:Math.min(Number(programCount),30)},(_,i)=>Number(programCount)-i);
   const cIds=Array.from({length:Math.min(Number(caseCount),30)},(_,i)=>Number(caseCount)-i);
   const[p,c]=await Promise.all([Promise.all(pIds.map(id=>read<Program>('get_program',[id]))),Promise.all(cIds.map(id=>read<CaseRecord>('get_case',[id])))]);
   setPrograms(p);setCases(c);
   setCredits(wallet?Number(await read<number>('get_demo_balance',[wallet])):null);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setLoading(false)}
 },[account]);
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
 const doConnect=async()=>{setError('');try{const a=await connectWallet();setAccount(a);await refresh(a);setNotice('Wallet connected to GenLayer Studionet.')}catch(e){setError(e instanceof Error?e.message:String(e))}};
 const act=async(label:string,fn:string,args:(string|number)[],complete?:()=>void)=>{
  setError('');setNotice('');setBusy(label);let hash='';
  try{
   await write(fn,args,account,h=>{hash=h;setTxs(prev=>[{hash:h,label,at:Date.now(),status:'pending'},...prev])});
   setTxs(prev=>prev.map(t=>t.hash===hash?{...t,status:'finalized'}:t));
   await refresh(account);complete?.();setNotice(`${label} executed successfully and finalized.`);
  }catch(e){const message=e instanceof Error?e.message:String(e);setError(message);if(hash)setTxs(prev=>prev.map(t=>t.hash===hash?{...t,status:message.includes('without successful execution')?'failed':'unverified'}:t))}
  finally{setBusy('')}
 };
 const myCases=cases.filter(c=>account&&c.claimant.toLowerCase()===account.toLowerCase());
 const shown=useMemo(()=>programs.filter(p=>p.label.toLowerCase().includes(search.toLowerCase())||String(p.id)===search),[programs,search]);
 const sendClaim=(event:React.FormEvent)=>{event.preventDefault();if(!selectedProgram)return;void act('Submit incident claim','submit_claim',[selectedProgram.id,claimTx.trim()],()=>setClaimTx(''))};
 const sendProgram=(event:React.FormEvent)=>{
  event.preventDefault();const start=toUtc(create.start),end=toUtc(create.end),deadline=toUtc(create.deadline);
  if([start,end,deadline].some(x=>!Number.isSafeInteger(x))){setError('Invalid UTC timestamps.');return}
  void act('Create reimbursement program','create_program',[create.label.trim(),create.contract.trim(),start,end,deadline,create.url.trim(),create.sha.trim(),Number(create.award),Number(create.max)],()=>setTab('programs'));
 };
 const openProgram=(id:number)=>{setSelected(id);setReports({url:'',sha:''});setClaimTx('')};
 return <div className="shell">
  <header className="topbar"><div className="container top-inner"><button className="logo" onClick={()=>{setSelected(null);setTab('programs')}}><span className="logo-symbol"><ShieldCheck size={21}/></span><strong>COVER<span>DICT</span></strong><small>TESTNET</small></button><nav className="nav"><button className={tab==='programs'?'active':''} onClick={()=>{setSelected(null);setTab('programs')}}>Programs</button><button className={tab==='claims'?'active':''} onClick={()=>{setSelected(null);setTab('claims')}}>My Claims</button><button className={tab==='create'?'active':''} onClick={()=>{setSelected(null);setTab('create')}}>Create Program</button><button className={tab==='activity'?'active':''} onClick={()=>{setSelected(null);setTab('activity')}}>Activity</button></nav><div className="wallet-actions"><span className="net"><i/> Studionet</span><button className="btn border" onClick={()=>account?setAccount(''):void doConnect()}><Wallet size={16}/>{account?addr(account):'Connect wallet'}</button></div></div></header>
  <main className="container main">
   {!ready&&<section className="warning"><LockKeyhole size={20}/><div><strong>Deployment pending · No synthetic markets are shown</strong><p>Contract source is ready for testnet integration, but COVERDICT has not been deployed or verified. Configure <code>VITE_COVERDICT_CONTRACT_ADDRESS</code> after a successful Studionet deployment.</p></div></section>}
   {error&&<section className="error" role="alert"><X size={18}/><span>{error}</span><button onClick={()=>setError('')}><X size={16}/></button></section>}
   {notice&&<section className="success" role="status"><Check size={18}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={16}/></button></section>}
   {tab==='programs'&&<>
    <section className="hero"><div><div className="eyebrow"><span className="dot"/> GENLAYER INTELLIGENT CLAIM ADJUDICATION</div><h1>When DeFi breaks,<br/><em>evidence matters.</em></h1><p>{intro}</p><div className="actions"><button className="btn primary" onClick={()=>setTab('claims')}>My claims <ArrowRight size={16}/></button><a className="btn border" href="https://github.com/bearbaba/COVERDICT" target="_blank" rel="noreferrer">Read the source <ExternalLink size={16}/></a></div></div><div className="hero-art"><div className="halo"><Shield size={66} strokeWidth={1.25}/></div><div className="float-tag"><Fingerprint size={15}/> EVIDENCE-BOUND</div><div className="float-tag bottom"><FileCheck2 size={15}/> CONSENSUS VERIFIED</div></div></section>
    <section className="numbers"><div><span>REGISTERED PROGRAMS</span><strong>{programs.length}</strong></div><div><span>RECORDED CLAIMS</span><strong>{cases.length}</strong></div><div><span>APPROVED CLAIMS</span><strong>{cases.filter(c=>c.status==='APPROVED'||c.status==='CLAIMED').length}</strong></div><div><span>YOUR DEMO CREDITS</span><strong>{credits??'—'}</strong></div></section>
    <div className="section-title"><div><div className="eyebrow">INCIDENT PROGRAMS</div><h2>Explore coverage demonstrations</h2></div><div className="lookup"><Search size={16}/><input placeholder="Search program or ID" value={search} onChange={e=>setSearch(e.target.value)}/><button aria-label="Refresh" title="Refresh" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={16}/></button></div></div>
    {shown.length===0?<div className="empty"><Layers size={32}/><h3>No on-chain programs to show</h3><p>Programs appear here only after a verified contract is deployed and an issuer creates one. We never fabricate incident claims.</p></div>:<div className="cards">{shown.map(p=><button key={p.id} className="program-card" onClick={()=>openProgram(p.id)}><div className="card-top"><span className="tiny">PROGRAM #{p.id.toString().padStart(3,'0')}</span><span className="pill">{p.status.replaceAll('_',' ')}</span></div><h3>{p.label}</h3><p><span>Affected destination</span> <code>{addr(p.deposit_contract)}</code></p><div className="card-footer"><span><Clock3 size={14}/> Claims close {when(p.claim_deadline)}</span><strong>{p.award_credits} test credits <ArrowUpRight size={16}/></strong></div></button>)}</div>}
   </>}
   {tab==='claims'&&<><div className="section-title"><div><div className="eyebrow">WALLET-BOUND CLAIMS</div><h2>My Claims</h2></div><button className="btn border" onClick={()=>void refresh()}><RefreshCw size={15}/> Refresh</button></div>{!account?<div className="empty"><Wallet size={30}/><h3>Connect your wallet</h3><p>Your on-chain cases will be shown here after you connect the claimant wallet.</p></div>:myCases.length===0?<div className="empty"><FileCheck2 size={30}/><h3>No claims for this wallet</h3><p>Open a demonstration program and submit a transaction hash if it matches the disclosed rules.</p></div>:<div className="claims">{myCases.map(c=><article className="case" key={c.id}><div className="card-top"><span className="tiny">CLAIM #{c.id.toString().padStart(3,'0')} · PROGRAM #{c.program_id}</span><span className={`pill ${c.status.toLowerCase()}`}>{c.status}</span></div><h3>{c.outcome||'Awaiting review'}</h3><p>{c.reason||'Submitted. Consensus has not yet assessed the evidence.'}</p><a href={`https://eth-sepolia.blockscout.com/tx/${c.tx_hash}`} target="_blank" rel="noreferrer">View Sepolia testnet receipt <ExternalLink size={14}/></a><div className="case-actions">{c.status==='SUBMITTED'&&<button className="btn primary" disabled={!canWrite} onClick={()=>void act('Resolve claim','resolve_claim',[c.id])}>Run independent consensus <ArrowRight size={16}/></button>}{c.status==='APPROVED'&&!c.claimed&&<button className="btn primary" disabled={!canWrite} onClick={()=>void act('Claim demo award','claim_demo_award',[c.id])}>Claim {c.award_credits} demo credits <Check size={16}/></button>}{c.status==='SUBMITTED'&&Date.now()>=(programs.find(p=>p.id===c.program_id)?.claim_deadline??Infinity)*1000+7*86400_000&&<button className="btn border" disabled={!canWrite} onClick={()=>void act('Close unresolved claim','close_unverifiable_claim',[c.id])}>Close as unverifiable</button>}{c.status==='CLAIMED'&&<span className="verified"><CheckCircle2 size={16}/> Award claimed once</span>}</div></article>)}</div>}</>}
   {tab==='create'&&<><div className="eyebrow">ADVANCED · ISSUER-DEFINED DEMO PROGRAM</div><h2>Create a program</h2><p className="lead">This form registers a synthetic eligibility policy, not an insurance product. You must publish a policy under a pinned Git commit before the incident begins. No real assets are ever deposited.</p><form className="form-card" onSubmit={sendProgram}><label>Program label<input value={create.label} onChange={e=>setCreate(v=>({...v,label:e.target.value}))} placeholder="Simulated vault coverage · Example protocol" required minLength={8}/></label><label>Sepolia address receiving the test transaction<input value={create.contract} onChange={e=>setCreate(v=>({...v,contract:e.target.value}))} placeholder="0x..." required/></label><div className="columns"><label>Incident window start (UTC)<input type="datetime-local" value={create.start} onChange={e=>setCreate(v=>({...v,start:e.target.value}))} required/></label><label>Incident window end (UTC)<input type="datetime-local" value={create.end} onChange={e=>setCreate(v=>({...v,end:e.target.value}))} required/></label></div><label>Claims submission deadline (UTC)<input type="datetime-local" value={create.deadline} onChange={e=>setCreate(v=>({...v,deadline:e.target.value}))} required/></label><label>Immutable policy raw URL<input value={create.url} onChange={e=>setCreate(v=>({...v,url:e.target.value}))} placeholder="https://raw.githubusercontent.com/bearbaba/COVERDICT/<40-char-commit>/evidence/policy.txt" required/></label><label>SHA-256 hash of policy bytes<input value={create.sha} onChange={e=>setCreate(v=>({...v,sha:e.target.value}))} placeholder="64 lowercase hexadecimal characters" required/></label><div className="columns"><label>Demo credits per eligible claim<input type="number" min="1" max="10000" value={create.award} onChange={e=>setCreate(v=>({...v,award:e.target.value}))}/></label><label>Maximum claims<input type="number" min="1" max="20" value={create.max} onChange={e=>setCreate(v=>({...v,max:e.target.value}))}/></label></div><button className="btn primary wide" disabled={!canWrite}>{busy||'Create on-chain program'} <ArrowRight size={16}/></button></form></>}
   {tab==='activity'&&<><div className="eyebrow">WALLET-BROWSER TRANSACTION HISTORY</div><h2>Activity</h2><p className="lead">Recent transaction hashes stored in this browser only. This is not a chain-wide transaction index.</p>{txs.length===0?<div className="empty"><Activity size={30}/><h3>No transactions recorded in this browser</h3></div>:<div className="activity">{txs.map(t=><a href={contractExplorer(t.hash)} key={t.hash} target="_blank" rel="noreferrer"><div><strong>{t.label}</strong><small>{addr(t.hash)} · {new Date(t.at).toLocaleString()}</small></div><span className={`pill ${t.status}`}>{t.status}</span><ExternalLink size={15}/></a>)}</div>}</>}
  </main>
  <footer className="footer"><div className="container"><div><ShieldCheck size={16}/> COVERDICT <span>· TESTNET EXPERIMENT · NON-REDEEMABLE DEMO CREDITS</span></div><div>Contract: {ready?addr(address):'Not deployed'} · <a href="https://github.com/bearbaba/COVERDICT/blob/main/SECURITY.md" target="_blank" rel="noreferrer">Security & limitations</a></div></div></footer>
  {selectedProgram&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><aside className="drawer" role="dialog" aria-modal="true" aria-label={`Program ${selectedProgram.id}`}><div className="drawer-header"><div className="eyebrow">PROGRAM #{selectedProgram.id} · ISSUER-DEFINED</div><button className="icon" onClick={()=>setSelected(null)} aria-label="Close program"><X size={20}/></button></div><h2>{selectedProgram.label}</h2><span className="pill">{selectedProgram.status.replaceAll('_',' ')}</span><section><h4>Incident window</h4><p>{when(selectedProgram.incident_start)} – {when(selectedProgram.incident_end)}</p><h4>Claim submission closes</h4><p>{when(selectedProgram.claim_deadline)}</p><h4>Evidence boundaries</h4><p>Direct test-ETH transaction on Ethereum Sepolia into the specified contract. This verifies a transfer, <strong>not financial loss</strong>.</p><code className="wordbreak">{selectedProgram.deposit_contract}</code><div className="links"><a href={selectedProgram.policy_url} target="_blank" rel="noreferrer">Pinned policy <ExternalLink size={14}/></a>{selectedProgram.report_url&&<a href={selectedProgram.report_url} target="_blank" rel="noreferrer">Pinned incident report <ExternalLink size={14}/></a>}</div><div className="muted">Submitted: {selectedProgram.submitted}/{selectedProgram.max_claims} · Approved: {selectedProgram.approved} · Award: {selectedProgram.award_credits} demo credits</div></section>{selectedProgram.status==='OPEN_FOR_CLAIMS'&&<form className="drawer-form" onSubmit={sendClaim}><h4>Submit a claim</h4><p>Your connected wallet must be the sender of the Sepolia testnet transaction. Only one transaction per program per wallet is allowed.</p><input value={claimTx} onChange={e=>setClaimTx(e.target.value)} placeholder="0x... Sepolia testnet transaction hash" required/><button className="btn primary wide" disabled={!canWrite}>{busy||'Submit claim'} <ArrowRight size={16}/></button></form>}{selectedProgram.status==='AWAITING_INCIDENT_REPORT'&&account.toLowerCase()===selectedProgram.issuer&&<form className="drawer-form" onSubmit={e=>{e.preventDefault();void act('Attach incident report','attach_report',[selectedProgram.id,reports.url.trim(),reports.sha.trim()],()=>setReports({url:'',sha:''}))}}><h4>Issuer · Attach immutable incident report</h4><p>Only permitted after the incident window ends. Report cannot be replaced.</p><input value={reports.url} onChange={e=>setReports(v=>({...v,url:e.target.value}))} placeholder="Pinned GitHub evidence URL" required/><input value={reports.sha} onChange={e=>setReports(v=>({...v,sha:e.target.value}))} placeholder="SHA256 of report bytes" required/><button className="btn primary wide" disabled={!canWrite}>{busy||'Pin incident report'}</button></form>}</aside></div>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
