import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import {Activity,ArrowRight,ArrowUpRight,Check,CheckCircle2,Clock3,ExternalLink,FileCheck2,Fingerprint,Layers,LockKeyhole,RefreshCw,Search,Shield,ShieldCheck,Wallet,X} from'lucide-react';
import{address,connectWallet,contractExplorer,read,ready,write,type Program,type CaseRecord,type TxRecord}from'./genlayer';
import'./style.css';

type Tab='programs'|'claims'|'create'|'activity';
// Wallet-local activity is intentionally separate from public chain data.
const STORAGE_PREFIX='coverdict-testnet-wallet-activity-v2';
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
const intro='Explore synthetic incident programs, submit a Sepolia testnet receipt, and inspect how GenLayer consensus determines eligibility for nonredeemable demo credits.';
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
 const[selected,setSelected]=useState<number|null>(null);
 const[claimTx,setClaimTx]=useState('');
 const[reports,setReports]=useState({url:'',sha:''});
 const[create,setCreate]=useState({label:'',contract:'',start:datePlaceholder(86400_000),end:datePlaceholder(2*86400_000),deadline:datePlaceholder(3*86400_000),url:'',sha:'',award:'100',max:'10'});
 const[txs,setTxs]=useState<TxRecord[]>([]);
 const currentWallet=useRef('');
 const selectedProgram=programs.find(p=>p.id===selected)??null;
 const canWrite=ready&&!!account&&!busy;
 const isClaimWindowOpen=(p:Program)=>p.status==='OPEN_FOR_CLAIMS'&&Date.now()/1000<p.claim_deadline;
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
   const [programCount,caseCount]=await Promise.all([read<number>('get_program_count'),read<number>('get_case_count')]);
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
 const doConnect=async()=>{setError('');try{const a=await connectWallet();setAccount(a);await refresh(a);}catch(e){setError(e instanceof Error?e.message:String(e))}};
 const hideWallet=()=>{setAccount('');setCredits(null);setNotice('Wallet hidden locally. Revoke site access in your wallet settings if desired.');};
 const act=async(label:string,fn:string,args:(string|number)[],complete?:()=>void)=>{
  setError('');setNotice('');setBusy(label);let hash='';
  const actor=account;
  try{
   await write(fn,args,actor,h=>{hash=h;recordActivity(actor,prev=>[{hash:h,label,at:Date.now(),status:'pending'},...prev])});
   recordActivity(actor,prev=>prev.map(t=>t.hash===hash?{...t,status:'finalized'}:t));
   await refresh(actor);complete?.();setNotice(`${label} executed successfully and finalized.`);
  }catch(e){const message=e instanceof Error?e.message:String(e);setError(message);if(hash)recordActivity(actor,prev=>prev.map(t=>t.hash===hash?{...t,status:message.includes('without successful execution')?'failed':'unverified'}:t))}
  finally{setBusy('')}
 };
 const shownCases=claimScope==='all'?cases:cases.filter(c=>account&&c.claimant.toLowerCase()===account.toLowerCase());
 const shown=useMemo(()=>programs.filter(p=>p.label.toLowerCase().includes(search.toLowerCase())||String(p.id)===search),[programs,search]);
 const sendClaim=(event:React.FormEvent)=>{
  event.preventDefault();
  if(!selectedProgram)return;
  if(!isClaimWindowOpen(selectedProgram)){setError('The claim submission deadline has passed.');return}
  if(!/^0x[0-9a-fA-F]{64}$/.test(claimTx.trim())){setError('Enter a valid 32-byte Sepolia transaction hash.');return}
  void act('Submit incident claim','submit_claim',[selectedProgram.id,claimTx.trim()],()=>setClaimTx(''));
 };
 const sendProgram=(event:React.FormEvent)=>{
  event.preventDefault();const start=toUtc(create.start),end=toUtc(create.end),deadline=toUtc(create.deadline);
  if([start,end,deadline].some(x=>!Number.isSafeInteger(x))){setError('Invalid local date or time.');return}
  if(!/^0x[0-9a-fA-F]{40}$/.test(create.contract.trim())||!/^https:\/\/raw\.githubusercontent\.com\/bearbaba\/COVERDICT\/[0-9a-f]{40}\/evidence\/[a-zA-Z0-9_/-]+\.txt$/.test(create.url.trim())||!/^([0-9a-f]{64})$/.test(create.sha.trim())){
   setError('Use a valid Sepolia recipient, a SHA256-pinned policy URL in this repository, and a lowercase 64-character SHA256 digest.');return;
  }
  if(start<Math.floor(Date.now()/1000)+16*60||!(start<end&&end<deadline)||deadline>Date.now()/1000+30*86400){
   setError('Choose a future incident start at least 16 minutes from now, with start < end < deadline, all within 30 days.');return;
  }
  void act('Create reimbursement program','create_program',[create.label.trim(),create.contract.trim(),start,end,deadline,create.url.trim(),create.sha.trim(),Number(create.award),Number(create.max)],()=>setTab('programs'));
 };
 const openProgram=(id:number)=>{setSelected(id);setReports({url:'',sha:''});setClaimTx('')};
 return <div className="shell">
  <header className="topbar"><div className="container top-inner"><button className="logo" onClick={()=>{setSelected(null);setTab('programs')}}><span className="logo-symbol"><ShieldCheck size={21}/></span><strong>COVER<span>DICT</span></strong><small>TESTNET</small></button><nav className="nav"><button className={tab==='programs'?'active':''} onClick={()=>{setSelected(null);setTab('programs')}}>Programs</button><button className={tab==='claims'?'active':''} onClick={()=>{setSelected(null);setClaimScope('all');setTab('claims')}}>Public Claims</button><button className={tab==='create'?'active':''} onClick={()=>{setSelected(null);setTab('create')}}>Create Program</button>{account&&<button className={tab==='activity'?'active':''} onClick={()=>{setSelected(null);setTab('activity')}}>My Activity</button>}</nav><div className="wallet-actions"><span className="net"><i/> Studionet</span><button className="btn border" title={account?'Hide wallet from this app (does not revoke permissions)':'Connect wallet'} onClick={()=>account?hideWallet():void doConnect()}><Wallet size={16}/>{account?addr(account)+' · Hide':'Connect wallet'}</button></div></div></header>
  <main className="container main">
   {!ready&&<section className="warning"><LockKeyhole size={20}/><div><strong>Contract not configured</strong><p>Set <code>VITE_COVERDICT_CONTRACT_ADDRESS</code> to the verified COVERDICT Studionet address at build time. We never display fabricated contract data.</p></div></section>}
   {error&&<section className="error compact-error" role="alert"><X size={16}/><span>{error}</span><button onClick={()=>setError('')}><X size={16}/></button></section>}
   {notice&&<section className="success" role="status"><Check size={18}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={16}/></button></section>}
   {tab==='programs'&&<>
    <section className="hero"><div><div className="eyebrow"><span className="dot"/> ON-CHAIN CLAIMS · GENLAYER CONSENSUS</div><h1>Claims backed by<br/><em>verifiable evidence.</em></h1><p>{intro}</p><div className="actions"><button className="btn primary" onClick={()=>document.getElementById('program-list')?.scrollIntoView({behavior:'smooth'})}>Explore programs <ArrowRight size={16}/></button><button className="btn border" onClick={()=>{setClaimScope('mine');setTab('claims')}}>My claims</button><a className="btn border" href="https://github.com/bearbaba/COVERDICT" target="_blank" rel="noreferrer">Read the source <ExternalLink size={16}/></a></div></div><div className="hero-art"><div className="halo"><Shield size={66} strokeWidth={1.25}/></div><div className="float-tag"><Fingerprint size={15}/> EVIDENCE-BOUND</div><div className="float-tag bottom"><FileCheck2 size={15}/> PUBLIC CLAIM STATES</div></div></section>
    <section className="numbers"><div><span>ON-CHAIN PROGRAMS</span><strong>{programTotal??'—'}</strong></div><div><span>ON-CHAIN CLAIMS</span><strong>{caseTotal??'—'}</strong></div><div><span>APPROVED · LOADED</span><strong>{cases.filter(c=>c.status==='APPROVED'||c.status==='CLAIMED').length}</strong></div><div><span>CLAIMED · LOADED</span><strong>{cases.filter(c=>c.status==='CLAIMED').length}</strong></div></section>
    <div id="program-list" className="section-title"><div><div className="eyebrow">SYNTHETIC INCIDENT PROGRAMS</div><h2>Explore testnet programs</h2></div><div className="lookup"><Search size={16}/><input placeholder="Search program or ID" value={search} onChange={e=>setSearch(e.target.value)}/><button aria-label="Refresh" title="Refresh" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={16}/></button></div></div>
    {dataError&&<div className="data-status" role="status"><span>Studionet data is temporarily unavailable. Your on-chain programs have not been cleared.</span><button className="btn border" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={14}/> Retry</button></div>}
    {loading&&!loaded?<div className="data-status">Loading on-chain programs…</div>:!dataError&&shown.length===0?<div className="empty"><Layers size={32}/><h3>No on-chain programs to show</h3><p>Programs appear only after an on-chain issuer creates them. Each program is issuer-defined and does not represent real coverage.</p></div>:<div className="cards">{shown.map(p=><button key={p.id} className="program-card" onClick={()=>openProgram(p.id)}><div className="card-top"><span className="tiny">PROGRAM #{p.id.toString().padStart(3,'0')}</span><span className="pill">{p.status.replaceAll('_',' ')}</span></div><h3>{p.label}</h3><p><span>Sepolia demo recipient</span> <code>{addr(p.deposit_contract)}</code></p><div className="card-footer"><span><Clock3 size={14}/> Claims close {when(p.claim_deadline)}</span><strong>{p.award_credits} demo credits <ArrowUpRight size={16}/></strong></div></button>)}</div>}
    {programTotal!==null&&programTotal>programs.length&&<div className="load-more"><span>Showing {programs.length} of {programTotal} on-chain programs</span><button className="btn border" disabled={loading} onClick={()=>setProgramLimit(n=>n+30)}>Load older programs <ArrowRight size={14}/></button></div>}
   </>}
   {tab==='claims'&&<>{dataError&&<div className="data-status"><span>Unable to refresh claims from Studionet.</span><button className="btn border" onClick={()=>void refresh()} disabled={loading}>Retry</button></div>}<div className="section-title"><div><div className="eyebrow">PUBLIC ON-CHAIN CLAIM HISTORY</div><h2>{claimScope==='all'?'Public claims':'My claims'}</h2></div><div className="claim-scope"><button className={claimScope==='all'?'active':''} onClick={()=>setClaimScope('all')}>All claims</button><button className={claimScope==='mine'?'active':''} onClick={()=>setClaimScope('mine')}>My claims</button><button className="btn border" onClick={()=>void refresh()}><RefreshCw size={15}/> Refresh</button></div></div>{claimScope==='mine'&&account&&<div className="wallet-summary"><div className="wallet-summary-identity"><Wallet size={18}/><div><span>CONNECTED WALLET</span><strong>{addr(account)}</strong></div></div><div className="wallet-summary-balance"><span>MY DEMO CREDITS</span><strong>{credits??'—'}</strong></div></div>}{claimScope==='mine'&&!account?<div className="empty"><Wallet size={30}/><h3>Connect your wallet</h3><p>To filter claims belonging to your address, connect the claimant wallet. You can still view public claims without connecting.</p></div>:shownCases.length===0?<div className="empty"><FileCheck2 size={30}/><h3>No matching claims in the loaded history</h3><p>Browse a program to submit a Sepolia testnet receipt. If older claims exist, use Load older claims below to fetch them.</p></div>:<div className="claims">{shownCases.map(c=><article className="case" key={c.id}><div className="card-top"><span className="tiny">CLAIM #{c.id.toString().padStart(3,'0')} · PROGRAM #{c.program_id}</span><span className={`pill ${c.status.toLowerCase()}`}>{c.status}</span></div><h3>{c.outcome||'Awaiting review'}</h3><p>{c.reason||'Submitted. Consensus has not yet assessed the evidence.'}</p><details className="claim-proof"><summary>View claim evidence and rules</summary><p><strong>Evidence fingerprint:</strong> <code>{c.evidence_digest||'Not yet verified'}</code></p><p><strong>On-chain claimant (public):</strong> <code>{claimScope==='all'?addr(c.claimant):c.claimant}</code></p><p>Eligibility is based on the issuer's pinned synthetic terms and public testnet receipt, not actual DeFi loss.</p>{programs.find(p=>p.id===c.program_id)&&<a href={programs.find(p=>p.id===c.program_id)!.policy_url} target="_blank" rel="noreferrer">Read pinned policy <ExternalLink size={13}/></a>}</details><a href={`https://eth-sepolia.blockscout.com/tx/${c.tx_hash}`} target="_blank" rel="noreferrer">View Sepolia testnet receipt <ExternalLink size={14}/></a><div className="case-actions">{c.status==='SUBMITTED'&&<button className="btn primary" disabled={!canWrite} onClick={()=>void act('Resolve claim','resolve_claim',[c.id])}>Run independent consensus <ArrowRight size={16}/></button>}{c.status==='APPROVED'&&!c.claimed&&account.toLowerCase()===c.claimant.toLowerCase()&&<button className="btn primary" disabled={!canWrite} onClick={()=>void act('Claim demo award','claim_demo_award',[c.id])}>Claim {c.award_credits} demo credits <Check size={16}/></button>}{c.status==='SUBMITTED'&&Date.now()>=(programs.find(p=>p.id===c.program_id)?.claim_deadline??Infinity)*1000+7*86400_000&&<button className="btn border" disabled={!canWrite} onClick={()=>void act('Close unresolved claim','close_unverifiable_claim',[c.id])}>Close as unverifiable</button>}{c.status==='CLAIMED'&&<span className="verified"><CheckCircle2 size={16}/> Award claimed once</span>}</div></article>)}</div>}{caseTotal!==null&&caseTotal>cases.length&&<div className="load-more"><span>Scanned {cases.length} of {caseTotal} total claims. Older wallet claims may not be loaded.</span><button className="btn border" disabled={loading} onClick={()=>setCaseLimit(n=>n+30)}>Load older claims <ArrowRight size={14}/></button></div>}</>}
   {tab==='create'&&<><div className="eyebrow">ADVANCED · ISSUER-DEFINED DEMO PROGRAM</div><h2>Create a program</h2><p className="lead">Advanced issuer workflow. This creates a testnet simulation, not insurance. Anyone may publish a program; issuer claims are not independently endorsed. A pinned policy must exist before the incident window begins.</p><p className="field-note">All times below use your device's local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}). COVERDICT converts them to UTC timestamps before submission. Incident start must be at least 16 minutes in the future.</p><form className="form-card" onSubmit={sendProgram}><label>Program label<input value={create.label} onChange={e=>setCreate(v=>({...v,label:e.target.value}))} placeholder="Simulated vault coverage · Example protocol" required minLength={8}/></label><label>Sepolia address receiving the test transaction<input value={create.contract} onChange={e=>setCreate(v=>({...v,contract:e.target.value}))} placeholder="0x..." required/></label><div className="columns"><label>Incident window start (local time)<input type="datetime-local" value={create.start} onChange={e=>setCreate(v=>({...v,start:e.target.value}))} required/></label><label>Incident window end (local time)<input type="datetime-local" value={create.end} onChange={e=>setCreate(v=>({...v,end:e.target.value}))} required/></label></div><label>Claim deadline (local time)<input type="datetime-local" value={create.deadline} onChange={e=>setCreate(v=>({...v,deadline:e.target.value}))} required/></label><label>Immutable policy raw URL<input value={create.url} onChange={e=>setCreate(v=>({...v,url:e.target.value}))} placeholder="https://raw.githubusercontent.com/bearbaba/COVERDICT/<40-char-commit>/evidence/policy.txt" required/></label><label>SHA-256 hash of policy bytes<input value={create.sha} onChange={e=>setCreate(v=>({...v,sha:e.target.value}))} placeholder="64 lowercase hexadecimal characters" required/></label><div className="columns"><label>Demo credits per eligible claim<input type="number" min="1" max="10000" value={create.award} onChange={e=>setCreate(v=>({...v,award:e.target.value}))}/></label><label>Maximum claims<input type="number" min="1" max="20" value={create.max} onChange={e=>setCreate(v=>({...v,max:e.target.value}))}/></label></div><button className="btn primary wide" disabled={!canWrite}>{busy||'Create on-chain program'} <ArrowRight size={16}/></button></form></>}
   {tab==='activity'&&account&&<><div className="eyebrow">CURRENT WALLET · LOCAL HISTORY</div><h2>My Activity</h2><p className="lead">Only transactions initiated in this browser by {addr(account)} appear here. History is stored locally per wallet, not synchronized across browsers or shared as a public activity feed.</p>{txs.length===0?<div className="empty"><Activity size={30}/><h3>No activity stored for this wallet</h3><p>Older unassigned browser history is intentionally not mixed into this wallet. Public on-chain claims remain accessible in Public Claims.</p></div>:<div className="activity">{txs.map(t=><a href={contractExplorer(t.hash)} key={t.hash} target="_blank" rel="noreferrer"><div><strong>{t.label}</strong><small>{addr(t.hash)} · {new Date(t.at).toLocaleString()}</small></div><span className={`pill ${t.status}`}>{t.status}</span><ExternalLink size={15}/></a>)}</div>}</>}
  </main>
  <footer className="footer"><div className="container"><div><ShieldCheck size={16}/> COVERDICT <span>· TESTNET EXPERIMENT · NON-REDEEMABLE DEMO CREDITS</span></div><div>Contract: {ready?addr(address):'Not configured'} · <a href="https://github.com/bearbaba/COVERDICT/blob/main/SECURITY.md" target="_blank" rel="noreferrer">Security & limitations</a></div></div></footer>
  {selectedProgram&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><aside className="drawer" role="dialog" aria-modal="true" aria-label={`Program ${selectedProgram.id}`}><div className="drawer-header"><div className="eyebrow">PROGRAM #{selectedProgram.id} · ISSUER-DEFINED</div><button className="icon" onClick={()=>setSelected(null)} aria-label="Close program"><X size={20}/></button></div><h2>{selectedProgram.label}</h2><span className="pill">{selectedProgram.status.replaceAll('_',' ')}</span><section><h4>Incident window</h4><p>{when(selectedProgram.incident_start)} – {when(selectedProgram.incident_end)}</p><h4>Claim submission closes</h4><p>{when(selectedProgram.claim_deadline)}</p><h4>Evidence boundaries</h4><p>Issuer: <code className="wordbreak">{selectedProgram.issuer}</code> · Not independently endorsed.</p><p>Direct test-ETH transaction on Ethereum Sepolia to the designated recipient. A successful transfer verifies a payment, <strong>not financial loss, coverage or exploit causality</strong>.</p><code className="wordbreak">{selectedProgram.deposit_contract}</code><div className="links"><a href={selectedProgram.policy_url} target="_blank" rel="noreferrer">Pinned policy <ExternalLink size={14}/></a>{selectedProgram.report_url&&<a href={selectedProgram.report_url} target="_blank" rel="noreferrer">Pinned incident report <ExternalLink size={14}/></a>}</div><div className="muted">Submitted: {selectedProgram.submitted}/{selectedProgram.max_claims} · Approved: {selectedProgram.approved} · Award: {selectedProgram.award_credits} demo credits</div></section>{isClaimWindowOpen(selectedProgram)&&<form className="drawer-form" onSubmit={sendClaim}><h4>Submit a claim</h4><p>Your connected wallet must be the sender of the Sepolia testnet transaction. Only one transaction per program per wallet is allowed.</p><input value={claimTx} onChange={e=>setClaimTx(e.target.value)} placeholder="0x... Sepolia testnet transaction hash" required/><button className="btn primary wide" disabled={!canWrite}>{busy||'Submit claim'} <ArrowRight size={16}/></button></form>}{selectedProgram.status==='OPEN_FOR_CLAIMS'&&!isClaimWindowOpen(selectedProgram)&&<div className="drawer-form"><h4>Claim submission closed</h4><p>The program claim deadline has passed. Existing claims remain available in My Claims.</p></div>}{selectedProgram.status==='AWAITING_INCIDENT_REPORT'&&account.toLowerCase()===selectedProgram.issuer&&<form className="drawer-form" onSubmit={e=>{e.preventDefault();void act('Attach incident report','attach_report',[selectedProgram.id,reports.url.trim(),reports.sha.trim()],()=>setReports({url:'',sha:''}))}}><h4>Issuer · Attach immutable incident report</h4><p>Only permitted after the incident window ends. Report cannot be replaced.</p><input value={reports.url} onChange={e=>setReports(v=>({...v,url:e.target.value}))} placeholder="Pinned GitHub evidence URL" required/><input value={reports.sha} onChange={e=>setReports(v=>({...v,sha:e.target.value}))} placeholder="SHA256 of report bytes" required/><button className="btn primary wide" disabled={!canWrite}>{busy||'Pin incident report'}</button></form>}</aside></div>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
