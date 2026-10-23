'use strict';
(() => {
  const byId = id => document.getElementById(id);
  let catalog;
  let current;
  const drafts = new Map(); // Memory only: never persist client data to browser storage.
  const element = (tag, text) => {const node=document.createElement(tag); if(text)node.textContent=text; return node;};
  const fieldControls = () => Array.from(byId('fields').querySelectorAll('input,textarea'));
  function remember() {if(current)drafts.set(current.id,fieldControls().map(control=>control.value));}
  function show(id, focus=false) {
    const next=catalog.forms.find(form=>form.id===id);
    if(!next){byId('document').hidden=true;return;}
    remember(); current=next;
    byId('document-title').textContent=current.title;
    byId('document-meta').textContent=`${current.stage} · ${current.kind} · Version ${catalog.version}`;
    byId('document-summary').textContent=current.summary;
    byId('terms').replaceChildren();byId('fields').replaceChildren();byId('action-status').textContent='';byId('draft-output').hidden=true;byId('draft-text').value='';
    current.sections.forEach(([heading,body])=>{byId('terms').append(element('h3',heading),element('p',body));});
    const labels=['Your business contact name','Your business email',...current.fields];
    labels.forEach((label,index)=>{
      const wrapper=element('div');wrapper.className='field';
      const caption=element('label',label);caption.htmlFor=`field-${index}`;
      const input=element(index===1?'input':'textarea');input.id=caption.htmlFor;input.name=`detail-${index}`;
      if(index===1){input.type='email';input.autocomplete='email';}else{input.maxLength=4000;}
      input.value=drafts.get(current.id)?.[index]||'';
      const printed=element('div',input.value||'Not completed');printed.className='print-value';printed.setAttribute('aria-hidden','true');
      input.addEventListener('input',()=>{printed.textContent=input.value||'Not completed';});
      wrapper.append(caption,input,printed);byId('fields').append(wrapper);
    });
    byId('document').hidden=false;
    if(focus)byId('document-title').focus();
  }
  function preparedText() {
    const controls=fieldControls();
    return ['InboxEdge Agency — DRAFT / NOT SUBMITTED / NOT SIGNED',current.title,`Version ${catalog.version}`,
      'Preparation copy only. No agreement has been executed. Verified signing and final reviewed terms are required.',
      ...current.sections.flatMap(([heading,body])=>['',heading,body]),'',
      ...controls.map(control=>`${document.querySelector(`label[for="${control.id}"]`).textContent}: ${control.value||'Not completed'}`)
    ].join('\n');
  }
  byId('view-draft').addEventListener('click',()=>{
    if(!current)return;
    byId('draft-text').value=preparedText();byId('draft-output').hidden=false;byId('draft-text').focus();byId('draft-text').select();
    byId('action-status').textContent='Draft ready to copy. Nothing was submitted or signed.';
  });
  byId('download').addEventListener('click',()=>{
    if(!current)return;
    if(fieldControls().some(control=>!control.reportValidity()))return;
    const url=URL.createObjectURL(new Blob([preparedText()],{type:'text/plain;charset=utf-8'}));
    const anchor=element('a');anchor.href=url;anchor.download=`inboxedge-${current.id}-draft.txt`;
    document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    byId('draft-text').value=preparedText();byId('draft-output').hidden=false;
    byId('action-status').textContent='Draft download requested. If your browser blocks it, select and copy the prepared draft below. Nothing was submitted or signed.';
  });
  byId('print').addEventListener('click',()=>{if(current)window.print();});
  fetch('/forms/catalog.json',{credentials:'omit'}).then(response=>{if(!response.ok)throw new Error('unavailable');return response.json();}).then(data=>{
    if(!Array.isArray(data.forms)||!data.forms.length)throw new Error('invalid catalog');
    catalog=data;byId('cards').replaceChildren();
    catalog.forms.forEach(form=>{
      const card=element('article');card.className='card';
      const stage=element('p',`${form.stage} · ${form.kind}`);stage.className='eyebrow';
      const link=element('a',`Prepare ${form.title.toLowerCase()}`);link.href=`#${form.id}`;
      card.append(stage,element('h3',form.title),element('p',form.summary),link);byId('cards').append(card);
    });
    show(location.hash.slice(1));window.addEventListener('hashchange',()=>show(location.hash.slice(1),true));
  }).catch(()=>{byId('loading').textContent='Forms could not load. Please refresh or contact al@inboxedgeagency.com for assistance.';});
})();
