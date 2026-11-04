/* Legacy: a successful response means the request was stored in the private CRM. */
(function(){'use strict';
 const form=document.getElementById('f');if(!form)return;
 const byId=id=>document.getElementById(id),status=byId('fStatus'),button=byId('fSubmit');
 const endpoint='https://legacy-kazakhstan-requests.mutedgem1.chatgpt.site/submit';
 let pending=false,lastPayload='',requestId='',delivered=false;
 const val=id=>(byId(id)?.value||'').trim();
 function message(text,error){status.textContent=text;status.classList.toggle('error',!!error)}
 form.addEventListener('submit',async function(event){event.preventDefault();if(pending)return;
 if(!form.reportValidity())return;
 const phone=val('fPhone'),email=val('fEmail');
 if(!phone&&!email){message('Укажите телефон или email, чтобы менеджер мог ответить.',true);byId('fPhone').focus();return}
 if(phone&&phone.replace(/\D/g,'').length<7){message('Проверьте номер телефона.',true);byId('fPhone').focus();return}
 if(!byId('fConsent').checked){message('Подтвердите согласие на обработку заявки.',true);return}
 const selected=byId('fSec').selectedOptions[0]?.textContent||'Оборудование';
 const notes=[['Ширина ленты, мм','fW'],['Скорость ленты, м/с','fV'],['Материал','fM'],['Количество узлов','fQ'],['Описание задачи','fT']].map(([label,id])=>val(id)?label+': '+val(id):'').filter(Boolean).join('\n');
 const payload={company:val('fCo'),person:val('fWho'),phone,email,equipment:selected,notes,consent:true,website:val('fWebsite')};
 if(notes.length>4000){message('Сократите описание задачи до 4000 символов.',true);return}
 const fingerprint=JSON.stringify(payload);if(lastPayload!==fingerprint){lastPayload=fingerprint;requestId=crypto.randomUUID();delivered=false}
 if(delivered){message('Эта заявка уже сохранена. Для нового запроса измените данные формы.');return}
 pending=true;button.disabled=true;button.textContent='Отправляем…';message('Сохраняем заявку…');
 try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId}),signal:AbortSignal.timeout(25000)});let result;try{result=await response.json()}catch{throw Error('Не удалось получить ответ. Попробуйте снова или напишите в WhatsApp.')}
 if(!response.ok||!result.ok||!result.id)throw Error(result.error||'Заявка не сохранена. Используйте WhatsApp или попробуйте позже.');
 delivered=true;message('Заявка принята! Контакты и описание задачи сохранены. Менеджер свяжется с вами. Номер: '+result.id.slice(-8));
 // Do not send form contents or contacts to analytics. Only consenting visitors.
 try{const choice=JSON.parse(localStorage.getItem('legacy-measurement-v1')||'null');if(choice?.choice==='yes'&&typeof window.gtag==='function')window.gtag('event','conversion',{send_to:'AW-18554666014/Y6o_CP-jwbEdEJ74xo9F',value:0,currency:'USD',transaction_id:result.id})}catch(_){}
 }catch(error){message(error.name==='TimeoutError'?'Сохранение заняло больше времени. Повторите отправку: дубликат не создастся.':error.message,true)}
 finally{pending=false;button.disabled=false;button.textContent='Отправить заявку'}
 });
})();