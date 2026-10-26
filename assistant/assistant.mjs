import {validatedAnswer,failureMessage} from './response.mjs';
const form=document.querySelector('#assistant-form');
const question=document.querySelector('#question');
const send=document.querySelector('#send');
const conversation=document.querySelector('#conversation');
const status=document.querySelector('#status');
let busy=false;
function appendMessage(label,text,links=[]) {
  const article=document.createElement('article');article.className='message';
  const heading=document.createElement('h2');heading.textContent=label;
  const paragraph=document.createElement('p');paragraph.textContent=text;
  article.append(heading,paragraph);
  if(links.length){const list=document.createElement('ul');for(const item of links){const li=document.createElement('li');const link=document.createElement('a');link.href=item.url;link.textContent=item.label;li.append(link);list.append(li);}article.append(list);}
  conversation.append(article);
  // Keep only a short in-page history, never local storage or server sessions.
  while(conversation.children.length>12)conversation.firstElementChild.remove();
}
for(const button of document.querySelectorAll('[data-question]'))button.addEventListener('click',()=>{question.value=button.dataset.question;question.focus();});
form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy || !form.reportValidity())return;
  const message=question.value.trim();if(!message)return;
  busy=true;send.disabled=true;status.textContent='Checking your question…';
  appendMessage('You',message);question.value='';
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch('https://inboxedge-agent.alwilson-abc.workers.dev/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message}),credentials:'omit',cache:'no-store',signal:controller.signal});
    if(!response.ok){appendMessage('InboxEdge assistant',failureMessage(response.status));return;}
    if(!response.headers.get('Content-Type')?.includes('application/json'))throw new Error('Backend unavailable');
    const answer=validatedAnswer(await response.json());appendMessage('InboxEdge assistant',answer.message,answer.links);
  }catch{appendMessage('InboxEdge assistant',failureMessage(503));}
  finally{clearTimeout(timer);busy=false;send.disabled=false;status.textContent='Request finished. You can ask another public business question.';question.focus();}
});
