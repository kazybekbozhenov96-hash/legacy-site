/* Legacy · «Зона загрузки» — product catalogue with its own 3D viewer (sections 02–03) */
(function(){
"use strict";
if(!window.THREE||!THREE.OrbitControls)return;
const $=id=>document.getElementById(id),pview=$('pview');if(!pview)return;
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const T=THREE,R=window.LegacyRealism;
const tex=(n,s,rep)=>R?R.tex(T,n,s,rep):null;
function std(o){if(o.envMapIntensity===undefined)o.envMapIntensity=0.5;const m=new T.MeshStandardMaterial(o);m.color.convertSRGBToLinear();if(m.emissive)m.emissive.convertSRGBToLinear();return m;}
const M={
  paint:std({color:0x35526d,roughness:.55,metalness:.25}),
  galv:std({color:0x9aa3aa,roughness:.38,metalness:.9}),
  steel:std({color:0x7a8188,roughness:.42,metalness:.75}),
  shaft:std({color:0xc9cfd4,roughness:.22,metalness:1}),
  shell:std({color:0x2b2f34,roughness:.4,metalness:.55}),
  rubber:std({color:0x151617,roughness:.9,envMapIntensity:.4}),
  pu:std({color:0xe9a23b,roughness:.42}),
  puSoft:std({color:0xd98d2a,roughness:.5}),
  uhmw:std({color:0xe8eaec,roughness:.35}),
  ceramic:std({color:0xf0ede4,roughness:.35}),
  belt:std({color:0x151617,roughness:.85,transparent:true,opacity:.55,depthWrite:false,side:T.DoubleSide}),
  fabric:std({color:0xb9b2a2,roughness:.95,side:T.DoubleSide,transparent:true,opacity:.92}),
  concrete:std({color:0x8e9296,roughness:.95})
};
if(R){M.paint.map=tex('paint_c.jpg',true);M.paint.color.set(0x35526d).convertSRGBToLinear();M.galv.map=tex('galv_c.jpg',true);M.shell.map=tex('shell_c.jpg',true);
  M.concrete.map=tex('concrete_c.jpg',true,[3,3]);M.concrete.color.set(0xffffff);M.pu.map=tex('pu_c.jpg',true);M.puSoft.map=tex('pu_c.jpg',true);M.rubber.map=tex('rubber_c.jpg',true,[3,3]);}
const CUT=new T.Plane(new T.Vector3(0,0,-1),0);
function cut(m){const c=m.clone();c.side=T.DoubleSide;c.clippingPlanes=[CUT];c.userData.cut=true;return c;}
function mesh(g,m,p,x,y,z){const o=new T.Mesh(g,m);o.castShadow=o.receiveShadow=true;if(x!==undefined)o.position.set(x,y,z);if(p)p.add(o);return o;}
function box(w,h,d,m,p,x,y,z){return mesh(new T.BoxGeometry(w,h,d),m,p,x,y,z);}
function cylX(r,l,m,p,x,y,z,s){const g=new T.CylinderGeometry(r,r,l,s||24);g.rotateZ(Math.PI/2);return mesh(g,m,p,x,y,z);}
function cylZ(r,l,m,p,x,y,z,s){const g=new T.CylinderGeometry(r,r,l,s||24);g.rotateX(Math.PI/2);return mesh(g,m,p,x,y,z);}
const HEX=new T.CylinderGeometry(0.011,0.011,0.01,6);
function bolt(p,x,y,z,ax){const b=mesh(HEX,M.shaft,p,x,y,z);b.castShadow=false;if(ax==='z')b.rotation.x=Math.PI/2;if(ax==='x')b.rotation.z=Math.PI/2;return b;}
const TR=35*Math.PI/180;
/* troughed belt (ghost) over a length along x */
function ghostBelt(p,L,y){const W=1.2,s=new T.Shape();const C=Math.cos(TR),S=Math.sin(TR),c=0.2,wl=0.4;
  const pts=[[-c-wl*C,wl*S],[-c,0],[c,0],[c+wl*C,wl*S]];s.moveTo(pts[0][0],pts[0][1]+0.012);for(const q of pts)s.lineTo(q[0],q[1]+0.012);for(let i=3;i>=0;i--)s.lineTo(pts[i][0],pts[i][1]);
  const g=new T.ExtrudeGeometry(s,{depth:L,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-L/2,y,0);const m=mesh(g,M.belt,p);m.castShadow=false;return m;}
function roller(p,x,y,z,len,ang){const g=new T.Group();g.position.set(x,y,z);g.rotation.x=ang||0;p.add(g);cylZ(0.0665,len,M.shell,g,0,0,0,28);cylZ(0.012,len+0.04,M.shaft,g,0,0,0,10);return g;}
function idlerSet(p,x,y){const C=Math.cos(TR),S=Math.sin(TR);roller(p,x,y-0.0665,0,0.4);
  for(const sg of[-1,1]){roller(p,x,y-0.0665*C+0.21*S,sg*(0.2+0.21*C+0.0665*S),0.4,-sg*TR);box(0.05,0.36,0.01,M.paint,p,x,y-0.1,sg*0.58);}
  box(0.06,0.06,1.3,M.paint,p,x,y-0.3,0);}
/* ---------- builders (shaped after the Legacy catalogue pictures) ---------- */
const RED=std({color:0xb81a14,roughness:.55,envMapIntensity:.45}),BLK=std({color:0x161718,roughness:.85,envMapIntensity:.4}),
  BRN=std({color:0x8a4424,roughness:.6,metalness:.25,envMapIntensity:.5}),BLUE=std({color:0x2f6fb0,roughness:.4,metalness:.4}),GRY=std({color:0x8d949a,roughness:.5,metalness:.5}),
  WHT=std({color:0xf2f2ee,roughness:.35}),CYAN=std({color:0x3ec3ff,roughness:.3,emissive:0x1a8fd0,emissiveIntensity:.6}),
  GLS=std({color:0xd8e4ee,roughness:.15,metalness:.1,transparent:true,opacity:.28,side:T.DoubleSide,depthWrite:false});
if(R)GRY.map=tex('galv_c.jpg',true);
/* impact bar: red top over black base, length along x */
function ibar(p,x,y,z,L,rx,w){const g=new T.Group();g.position.set(x,y,z);g.rotation.x=rx||0;p.add(g);w=w||0.1;
  box(L,0.03,w,RED,g,0,0.015,0);box(L,0.035,w,BLK,g,0,-0.0175,0);box(L,0.012,w*0.45,GRY,g,0,-0.041,0);return g;}
/* trough of bars: n centre bars, m bars per wing at angle a */
function barTrough(p,L,y,nc,m,a,frame){const w=0.1,gap=0.008;const cw=nc*(w+gap);
  for(let i=0;i<nc;i++)ibar(p,0,y,-cw/2+(w+gap)*(i+0.5),L,0,w);
  for(const sg of[-1,1])for(let k=0;k<m;k++){const d=(w+gap)*(k+0.5),C=Math.cos(a),S=Math.sin(a);ibar(p,0,y+d*S,sg*(cw/2+d*C),L,-sg*a,w);}
  return cw/2+m*(w+gap)*Math.cos(a);}
function saddle(p,x,y,a,half,mat){/* cross support under the bars */
  const C=Math.cos(a),S=Math.sin(a);box(0.08,0.06,0.62,mat,p,x,y-0.08,0);
  for(const sg of[-1,1]){const wl=(half-0.3)/C;const b=box(0.08,0.06,wl,mat,p,x,y-0.08+wl*S/2,sg*(0.31+wl*C/2));b.rotation.x=-sg*a;
    box(0.08,0.24+wl*S,0.06,mat,p,x,y-0.2+wl*S/2,sg*(half-0.02));}
  box(0.1,0.06,2*half+0.15,mat,p,x,y-0.33,0);}
function buildStation(){const g=new T.Group(),L=1.5,y=0.5,a=0.55;
  const half=barTrough(g,L,y,5,4,a);
  for(const x of[-L/2+0.12,0,L/2-0.12])saddle(g,x,y,a,half,BRN);
  for(const sg of[-1,1]){box(L+0.1,0.07,0.07,BRN,g,0,y-0.33,sg*(half+0.02));for(const x of[-L/2+0.12,L/2-0.12]){cylX(0.05,0.12,BLUE,g,x,y-0.38,sg*(half-0.15),20);box(0.2,0.015,0.16,BRN,g,x,y-0.37,sg*(half+0.08));}}
  return{root:g,parts:[{t:'Амортизирующие балки',p:[0.3,y+0.02,0]},{t:'Опорная рама',p:[-0.63,y-0.1,0.4]},{t:'Боковые секции',p:[0.4,y+0.25,half-0.1]},{t:'Демпфирующие опоры',p:[L/2-0.12,y-0.38,half-0.15]}],
   list:['Амортизирующие балки: красный износостойкий слой на упругой основе','Центральная секция и боковые секции под углом желоба','Опорная рама с поперечинами','Демпфирующие опоры на ставе'],
   desc:'Поглощают ударные нагрузки при падении транспортируемого материала на ленту в зонах загрузки и перегрузки. Защищают ленту от механических повреждений, снижают динамические нагрузки.',adv:'Распределяют воздействие падающего материала по опорному участку и ограничивают прогиб ленты.',
   sel:['Высота падения','Масса и размер куска','Производительность','Ширина и скорость ленты','Угол желоба']};}
function buildBar(){const g=new T.Group(),L=1.6;
  const a=new T.Group();a.position.set(0,0.35,-0.3);g.add(a);box(L,0.1,0.1,BLK,a,0,0,0);box(L,0.025,0.04,std({color:0x050505}),a,0,-0.05,0);
  const b=new T.Group();b.position.set(0,0.3,0.25);g.add(b);box(L,0.03,0.1,RED,b,0,0.045,0);box(L,0.07,0.1,BLK,b,0,-0.005,0);box(L,0.025,0.04,GRY,b,0,-0.05,0);
  for(let x=-0.7;x<=0.71;x+=0.35)bolt(b,x,-0.065,0);
  return{root:g,parts:[{t:'Резиновая балка',p:[0.4,0.4,-0.3]},{t:'Износостойкий слой скольжения',p:[0.4,0.36,0.25]},{t:'Амортизирующий слой',p:[-0.4,0.3,0.31]},{t:'Монтажный профиль',p:[-0.4,0.25,0.25]}],
   list:['Слой скольжения из UHMWPE или полиуретана (красный)','Упругий резиновый амортизирующий слой','Стальной монтажный профиль с Т-пазом под болты'],
   desc:'Сменные опорные элементы из резины, UHMWPE или композитов. Сочетают скольжение и амортизацию в зависимости от конструкции. Подбор по нагрузке, длине участка и температуре.',adv:'Сменные балки позволяют обновлять изношенные элементы без замены всей рамы.',
   sel:['Нагрузка','Длина участка','Температура','Ширина ленты']};}
function buildCombo(){const g=new T.Group(),L=1.4,y=0.5,a=0.55;
  const half=barTrough(g,L,y,5,3,a);
  for(const x of[-L/2+0.1,-0.25,0.25,L/2-0.1]){saddle(g,x,y,a,half,BRN);for(const sg of[-1,1])box(0.012,0.2,0.2,BRN,g,x+0.05,y-0.18,sg*(half-0.2));}
  for(const sg of[-1,1]){box(L+0.25,0.1,0.12,BRN,g,0,y-0.35,sg*(half+0.02));for(const x of[-L/2-0.12,L/2+0.12])box(0.06,0.012,0.22,BRN,g,x,y-0.4,sg*(half+0.02));}
  box(L+0.25,0.06,0.3,BRN,g,0,y-0.35,0);
  return{root:g,parts:[{t:'Опорные брусья',p:[0.3,y+0.02,0]},{t:'Боковые секции',p:[-0.3,y+0.2,half-0.1]},{t:'Усиленная рама',p:[0,y-0.35,half+0.02]}],
   list:['Опорные брусья по профилю желоба','Усиленная сварная рама с рёбрами','Регулируемые и выдвижные исполнения; возможна комбинация с роликоопорами'],
   desc:'Ролики и опорные брусья поддерживают ленту в зоне пересыпа. Доступны регулируемые и выдвижные конструкции для обслуживания.',adv:'Сочетают поддержку ленты у бортов с качением на роликах; выдвижные секции облегчают доступ.',
   sel:['Ширина ленты','Угол желоба','Шаг опор','Доступ для обслуживания']};}
function buildTorsion(){const g=new T.Group(),L=1.5,y=0.48,a=0.22;const mid=new T.Group();g.add(mid);
  for(let i=0;i<3;i++)ibar(mid,0,y,-0.22+i*0.22,L,0,0.2);
  for(const sg of[-1,1])for(let k=0;k<2;k++){const d=0.11+k*0.21;ibar(g,0,y+0.03+d*Math.sin(a),sg*(0.33+d*Math.cos(a)),L,-sg*a,0.2);}
  for(const x of[-0.55,0,0.55]){box(0.1,0.05,0.7,GRY,mid,x,y-0.08,0);
    for(const sg of[-1,1]){const t=new T.Group();t.position.set(x,y-0.17,sg*0.38);g.add(t);box(0.12,0.12,0.12,GRY,t,0,0,0);const c=mesh(new T.BoxGeometry(0.08,0.08,0.13),BLUE,t);c.rotation.z=Math.PI/4;
      box(0.03,0.12,0.03,GRY,t,0,0.07,-sg*0.06);}
    box(0.12,0.06,1.6,GRY,g,x,y-0.26,0);for(const sg of[-1,1])box(0.1,0.18,0.08,GRY,g,x,y-0.1,sg*0.7);}
  for(const sg of[-1,1]){box(L+0.2,0.08,0.1,GRY,g,0,y-0.3,sg*0.8);for(const x of[-L/2-0.05,L/2+0.05])box(0.14,0.012,0.18,GRY,g,x,y-0.34,sg*0.8);}
  return{root:g,mid,parts:[{t:'Центральная секция на торсионах',p:[0.3,y+0.02,0]},{t:'Торсионная опора',p:[-0.55,y-0.17,0.44]},{t:'Боковые неподвижные секции',p:[0.4,y+0.12,0.6]},{t:'Оцинкованная рама',p:[0,y-0.3,0.8]}],
   list:['Центральная секция подвешена на каучуковых торсионных демпферах','Боковые секции закреплены неподвижно под бортовыми уплотнениями','Направляющие из UHMWPE — поверхность скольжения без вращающихся узлов','Оцинкованная рама на опорах става'],
   desc:'Для зоны приёма материала с высокими ударными нагрузками. При падении материала упругие каучуковые элементы деформируются в торсионных опорах, центральная секция получает упругий ход и гасит колебания.',adv:'По данным каталога увеличивает срок службы ленты на 30 % и снижает риск аварийного простоя.',
   sel:['Высота падения','Масса и максимальный размер куска','Производительность','Ширина и скорость ленты','Угол желоба','Монтажная высота']};}
/* skirt plates: standalone like on the catalogue picture */
function slotPlate(L,H,t,slots){const s=new T.Shape();s.moveTo(-L/2,0);s.lineTo(L/2,0);s.lineTo(L/2,H);s.lineTo(-L/2,H);s.closePath();
  for(let i=0;i<slots;i++){const x=-L/2+L*(i+0.5)/slots,h=new T.Path();h.moveTo(x-0.012,H-0.025);h.lineTo(x+0.012,H-0.025);h.lineTo(x+0.012,H-0.085);h.lineTo(x-0.012,H-0.085);h.closePath();s.holes.push(h);}
  const g=new T.ExtrudeGeometry(s,{depth:t,bevelEnabled:false});g.translate(0,0,-t/2);return g;}
function buildPuSteel(cer){const g=new T.Group(),L=1.3,H=0.24;const p=new T.Group();p.position.set(0,0.2,0);p.rotation.y=-0.35;g.add(p);
  mesh(slotPlate(L,H,0.03,5),RED,p);
  if(cer){for(let i=0;i<34;i++)for(let j=0;j<6;j++){const x=-L/2+0.03+i*0.037,yy=0.022+j*0.037;const k=Math.min(4,Math.floor((x+L/2)/L*5)),sx=-L/2+L*(k+0.5)/5;if(Math.abs(x-sx)<0.032&&yy>H-0.105)continue;box(0.03,0.03,0.008,WHT,p,x,yy,0.018);}}
  else box(L,H*0.35,0.006,GRY,p,0,H*0.18,-0.018);
  return{root:g,parts:[{t:cer?'Керамика 92 % Al₂O₃':'Полиуретан 19 мм',p:[0.1,0.3,0.02]},{t:cer?'Полиуретановая основа':'Стальная основа 6 мм',p:[-0.4,0.25,-0.02]},{t:'Пазы для регулировки',p:[-0.39,0.39,0]}],
   list:cer?['Керамические элементы 13 мм (92 % Al₂O₃)','Полиуретановая основа 6 мм','Стальная подложка 6 мм','Продолговатые пазы для регулировки','Секции 1219 / 1524 × 178 × 25 мм']:['Полиуретановый рабочий слой 19 мм','Стальная основа 6 мм','Продолговатые пазы для регулировки','Секции 1219 / 1524 × 178 × 25 мм'],
   desc:cer?'Внутреннее уплотнение для защиты от абразивного износа: керамические элементы на полиуретановой основе и стальной подложке.':'Внутреннее уплотнение течки. Ставится со стороны потока, удерживает основной материал и разгружает наружный фартук.',
   adv:cer?'Керамика защищает зону контакта от абразивного износа, а полиуретановая основа поддерживает вставки.':'Принимает воздействие потока и защищает наружный фартук; крепёжные пазы упрощают регулировку.',
   sel:['Толщина стенки течки','Зазор до ленты','Длина уплотнения','Крупность и абразивность материала']};}
function profExtrude(pts,len,mat,p,x,y,z){const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.closePath();
  const g=new T.ExtrudeGeometry(s,{depth:len,bevelEnabled:true,bevelThickness:0.002,bevelSize:0.002,bevelSegments:1,curveSegments:8});g.translate(0,0,-len/2);return mesh(g,mat,p,x,y,z);}
function buildDual(){const g=new T.Group(),L=1.0;
  box(0.012,0.32,L+0.1,GRY,g,0.02,0.62,0);
  const pts=[[0,0.32],[0.014,0.32],[0.014,0.08],[0.06,0.03],[0.08,0.035],[0.08,0.0],[0.02,0.0],[-0.01,0.025],[-0.04,0.0],[-0.06,0.01],[-0.01,0.06],[0,0.08]];
  profExtrude(pts,L,RED,g,0,0.18,0).rotation.y=0;
  for(let z=-0.4;z<=0.41;z+=0.2){const c=new T.Group();c.position.set(0.03,0.52,z);g.add(c);box(0.04,0.16,0.07,GRY,c,0,0,0);box(0.09,0.03,0.07,GRY,c,0.03,0.06,0);bolt(c,0.06,0.075,0);bolt(c,0.022,-0.04,0,'x');}
  box(0.03,0.03,L+0.1,GRY,g,0.03,0.44,0);
  return{root:g,parts:[{t:'Основная кромка',p:[0.06,0.2,0.3]},{t:'Второй контур (фартук)',p:[-0.05,0.2,-0.3]},{t:'Прижимные кронштейны',p:[0.05,0.6,0.4]},{t:'Стенка течки',p:[0.02,0.75,-0.4]}],
   list:['Цельнолитой полиуретановый профиль','Основная кромка удерживает материал','Эластичный фартук — вторая линия уплотнения','Прижимные кронштейны снаружи течки с регулировкой'],
   desc:'Основная кромка удерживает материал, а эластичный фартук образует вторую линию уплотнения. Устанавливается снаружи течки с возможностью регулировки и замены.',adv:'Вторая кромка ограничивает выход мелочи и пыли за основной контур.',sel:['Толщина стенки течки','Зазор до ленты','Скорость и температура','Длина уплотнения']};}
function buildRail(snap){const g=new T.Group();
  if(!snap){const L=0.28;
    const A=[[0,0],[0.03,0],[0.04,0.02],[0.025,0.045],[0.012,0.05],[0.012,0.32],[-0.005,0.33],[-0.005,0.05],[-0.035,0.06],[-0.04,0.03],[-0.02,0.01]];
    const B=[[0,0],[0.035,0],[0.04,0.03],[0.02,0.05],[0.008,0.05],[0.008,0.36],[-0.008,0.36],[-0.008,0.05],[-0.03,0.04],[-0.035,0.015]];
    const C=[[0,0],[0.03,0],[0.035,0.025],[0.015,0.05],[0.01,0.05],[0.04,0.3],[0.025,0.31],[-0.008,0.05],[-0.035,0.05],[-0.04,0.02]];
    [A,B,C].forEach((pp,i)=>{const m=profExtrude(pp,L,RED,g,-0.4+i*0.4,0.03,0);m.rotation.y=Math.PI/2;});
    return{root:g,parts:[{t:'Профиль с опорным буртом',p:[-0.4,0.25,0]},{t:'Прямой профиль',p:[0,0.3,0]},{t:'Наклонный профиль',p:[0.4,0.25,0]}],
     list:['Полиуретановые профили разной формы под узел','Бурт снизу фиксируется в монтажной рейке','Изношенный участок меняют без замены всего уплотнения'],
     desc:'Полиуретановые профили для контактного уплотнения зоны пересыпа. Крепление на рейке и фиксация позволяют менять изношенный участок.',adv:'Позволяют заменить изношенный участок и восстановить положение уплотнения.',sel:['Высота профиля','Зазор до ленты','Скорость ленты','Температура']};}
  const L=1.2;const w=new T.Group();w.rotation.x=0.35;w.position.set(0,0.28,0.1);g.add(w);
  box(L,0.5,0.012,std({color:0x7a4a2c,roughness:.8,metalness:.4}),w,0,0.25,0);
  box(L,0.06,0.02,GRY,w,0,0.03,0.016);
  const pr=box(L,0.2,0.014,RED,w,0,-0.07,0.012);pr.rotation.x=-0.2;
  for(let x=-0.5;x<=0.51;x+=0.25){const c=mesh(new T.TorusGeometry(0.035,0.008,8,16,Math.PI),GRY,w,x,0.06,0.04);c.rotation.z=Math.PI;box(0.03,0.05,0.02,GRY,w,x,0.03,0.03);}
  const belt=box(1.4,0.012,0.8,BLK,g,0,0.06,-0.15);belt.rotation.x=-0.2;
  return{root:g,parts:[{t:'Профиль K-Snap-Loc',p:[0,0.2,0.15]},{t:'Монтажная рейка',p:[0.4,0.33,0.15]},{t:'Фиксаторы',p:[-0.5,0.36,0.2]},{t:'Стенка течки',p:[0.3,0.55,0.25]}],
   list:['Гибкий полиуретановый профиль 127 / 150 / 230 / 355 мм','Защёлкивается в монтажную рейку длиной 2000 мм','Быстросъёмные фиксаторы','Составы R69 (−30…+80 °C) и B93 (−25…+120 °C)'],
   desc:'Гибкий полиуретановый профиль закрывает зазор между стенкой течки и лентой. Уплотнение защёлкивается в монтажную рейку и удерживается фиксирующими элементами.',adv:'Защёлкивающееся крепление упрощает замену изношенного профиля без разборки стенки течки.',sel:['Высота профиля','Зазор до ленты','Скорость ленты','Температура']};}
function buildBlock(){const g=new T.Group(),L=1.2,a=0.55,C=Math.cos(a),S=Math.sin(a);
  box(L,0.012,0.5,BLK,g,0,0.3,0);for(const sg of[-1,1]){const w=box(L,0.012,0.7,BLK,g,0,0.3+0.35*S,sg*(0.25+0.35*C));w.rotation.x=-sg*a;}
  for(const sg of[-1,1]){box(L,0.36,0.014,GRY,g,0,0.55,sg*0.36);
    for(let i=0;i<7;i++){const x=-L/2+0.09+i*0.17;box(0.16,0.12,0.05,RED,g,x,0.38,sg*0.33);box(0.1,0.08,0.012,GRY,g,x,0.39,sg*0.305);bolt(g,x,0.39,sg*0.298,'z');}}
  box(0.014,0.36,0.72,GRY,g,-L/2,0.55,0);
  return{root:g,parts:[{t:'Сменные блоки Super Block',p:[0.2,0.4,0.3]},{t:'Прижимные пластины',p:[-0.3,0.42,-0.3]},{t:'Стенки течки',p:[0,0.7,0.36]},{t:'Лента',p:[0.4,0.32,0]}],
   list:['Сменные полиуретановые блоки по нижней кромке стенок','Прижимные пластины на болтах','Боковые и задняя стенки загрузочного узла'],
   desc:'Для самых тяжёлых условий. Сменные элементы для боковых и задней стенок загрузочного узла. Прижимные пластины и опоры под лентой подбирают совместно с уплотнением.',adv:'Закрывают боковые и задние зоны просыпи; отдельные блоки можно заменять по износу.',sel:['Геометрия загрузочного узла','Нагрузка','Крупность материала']};}
function buildNC(){const g=new T.Group(),Rr=1.0,cy=1.25,a0=0.62;
  const sh=new T.Shape(),N=24;for(let i=0;i<=N;i++){const t=-Math.PI/2-a0+2*a0*i/N;sh.lineTo?0:0;if(i===0)sh.moveTo(Math.cos(t)*Rr,Math.sin(t)*Rr);else sh.lineTo(Math.cos(t)*Rr,Math.sin(t)*Rr);}
  for(let i=N;i>=0;i--){const t=-Math.PI/2-a0+2*a0*i/N;sh.lineTo(Math.cos(t)*(Rr+0.015),Math.sin(t)*(Rr+0.015));}
  const bg=new T.ExtrudeGeometry(sh,{depth:1.0,bevelEnabled:false});bg.translate(0,0,-0.5);mesh(bg,std({color:0x2c3035,roughness:.8,side:T.DoubleSide}),g,0,cy,0);
  for(const sg of[-1,1]){const t=-Math.PI/2+sg*(a0-0.12),px=Math.cos(t)*(Rr-0.07),py=cy+Math.sin(t)*(Rr-0.07);
    const u=new T.Group();u.position.set(px,py,0);u.rotation.z=t+Math.PI/2;g.add(u);
    box(0.3,0.04,1.0,GRY,u,0,0.05,0);for(let k=0;k<5;k++)box(0.045,0.02,0.9,CYAN,u,-0.1+k*0.05,0.02,0);
    const post=box(0.04,py-0.02,0.04,GRY,g,px+sg*0.18,(py-0.02)/2,0.42);box(0.04,py-0.02,0.04,GRY,g,px+sg*0.18,(py-0.02)/2,-0.42);
    box(0.22,0.03,0.03,GRY,g,px+sg*0.08,py+0.03,0.42);box(0.22,0.03,0.03,GRY,g,px+sg*0.08,py+0.03,-0.42);}
  for(const z of[-0.42,0.42]){box(1.5,0.04,0.05,GRY,g,0,0.04,z);const cr=box(0.05,0.3,0.05,GRY,g,0,0.15,z);}
  return{root:g,parts:[{t:'Бесконтактный элемент',p:[0.5,0.62,0.3]},{t:'Лента',p:[0,0.27,0]},{t:'Рабочий зазор',p:[-0.5,0.55,-0.3]}],
   list:['Боковые и хвостовые элементы над кромкой ленты','Не касаются ленты: работают на рабочем зазоре','Положение и зазор настраивают по геометрии загрузочной зоны'],
   desc:'Боковые и хвостовые элементы для ограничения просыпи и выхода пылевоздушного потока. Положение и рабочий зазор согласуют по геометрии загрузочной зоны.',adv:'Рабочий зазор снижает трение о ленту; эффективность зависит от его правильной настройки.',sel:['Геометрия загрузочной зоны','Ширина ленты','Пылевыделение']};}
function buildCover(){const g=new T.Group(),L=2.6,R=0.5,y=0.45;
  const c=new T.CylinderGeometry(R,R,L,40,1,true,0,Math.PI);c.rotateZ(Math.PI/2);mesh(c,GLS,g,0,y+0.08,0).castShadow=false;
  for(let x=-L/2;x<=L/2+0.01;x+=0.43){const a=new T.TorusGeometry(R+0.005,0.012,6,24,Math.PI);const t=mesh(a,GRY,g,x,y+0.08,0);t.rotation.y=Math.PI/2;
    for(const sg of[-1,1])box(0.03,0.12,0.03,GRY,g,x,y+0.02,sg*R);}
  for(const sg of[-1,1])box(L,0.04,0.04,GRY,g,0,y+0.08,sg*R);
  box(L,0.008,0.62,BLK,g,0,y-0.01,0);
  for(let x=-L/2+0.3;x<L/2;x+=0.65){for(const sg of[-1,1]){const r=cylZ(0.04,0.3,GRY,g,x,y-0.04,sg*0.28,16);r.rotation.x=sg*0.5;const b=box(0.05,0.3,0.02,GRY,g,x,y-0.12,sg*0.36);b.rotation.x=-sg*0.4;}
    cylZ(0.04,0.3,GRY,g,x,y-0.06,0,16);box(0.06,0.04,0.9,GRY,g,x,y-0.22,0);}
  for(const sg of[-1,1])box(L+0.2,0.06,0.04,GRY,g,0,y-0.25,sg*0.45);
  return{root:g,parts:[{t:'Фильтрующее полотно',p:[0,y+0.58,0]},{t:'Дуги каркаса',p:[-0.43,y+0.45,0.35]},{t:'Роликоопоры под лентой',p:[0.35,y-0.1,0.4]}],
   list:['Воздухопроницаемое полотно над лентой','Дуговой каркас по всей длине зоны','Работает вместе с бортовыми уплотнениями и аспирацией'],
   desc:'Воздухопроницаемое полотно над лентой удерживает частицы пыли и позволяет выходить воздуху. Применяется совместно с бортовыми уплотнениями и системой пылеудаления.',adv:'Выпускает воздух через полотно, удерживая часть пыли внутри перегрузочного узла.',sel:['Длина зоны','Ширина ленты','Пылевыделение','Наличие аспирации']};}
const PRODUCTS=[
 {id:'z_station',grp:'Защита ленты в зоне загрузки',name:'Демпферные станции',short:'Амортизация удара',build:buildStation,step:2,img:29,page:'konveyer-udar.html'},
 {id:'z_torsion',grp:'Защита ленты в зоне загрузки',name:'Демпферный стол с торсионными опорами',short:'Самые тяжёлые условия',build:buildTorsion,step:2,img:32,page:'konveyer-udar.html'},
 {id:'z_bar',grp:'Защита ленты в зоне загрузки',name:'Амортизирующие балки',short:'Резина, UHMWPE, композит',build:buildBar,step:2,img:30,page:'konveyer-udar.html'},
 {id:'z_combo',grp:'Защита ленты в зоне загрузки',name:'Комбинированные опоры',short:'Ролики + опорные брусья',build:buildCombo,step:2,img:31,page:'konveyer-udar.html'},
 {id:'z_pus',grp:'Внутренние уплотнения течки',name:'Полиуретан на стальном основании',short:'1219 / 1524 × 178 × 25 мм',build:()=>buildPuSteel(false),step:3,img:33,page:'konveyer-uplotneniya.html'},
 {id:'z_puc',grp:'Внутренние уплотнения течки',name:'Полиуретан с керамикой',short:'Керамика 92 % Al₂O₃',build:()=>buildPuSteel(true),step:3,img:34,page:'konveyer-uplotneniya.html'},
 {id:'z_dual',grp:'Наружные бортовые уплотнения',name:'Двухконтурный полиуретановый профиль',short:'Две линии уплотнения',build:buildDual,step:3,img:38,page:'konveyer-uplotneniya.html'},
 {id:'z_rail',grp:'Наружные бортовые уплотнения',name:'Профили на монтажной рейке',short:'Замена участками',build:()=>buildRail(false),step:3,img:39,page:'konveyer-uplotneniya.html'},
 {id:'z_snap',grp:'Наружные бортовые уплотнения',name:'Пылезащитное уплотнение K-Snap-Loc',short:'Защёлкивается в рейку',build:()=>buildRail(true),step:3,img:41,page:'konveyer-uplotneniya.html'},
 {id:'z_block',grp:'Наружные бортовые уплотнения',name:'Уплотнения Super Block',short:'Самые тяжёлые условия',build:buildBlock,step:3,img:40,page:'konveyer-uplotneniya.html'},
 {id:'z_nc',grp:'Дополнительная пылезащита',name:'Бесконтактные уплотнения',short:'Работают на рабочем зазоре',build:buildNC,step:4,img:44,page:'konveyer-uplotneniya.html'},
 {id:'z_cover',grp:'Дополнительная пылезащита',name:'Фильтрующее укрытие',short:'Пыль внутри, воздух наружу',build:buildCover,step:4,img:45,page:'konveyer-uplotneniya.html'}
];
/* ---------- viewer ---------- */
let pr;try{pr=new T.WebGLRenderer({antialias:true});}catch(e){return;}
pr.setPixelRatio(Math.min(2,window.devicePixelRatio||1));pr.shadowMap.enabled=true;pr.shadowMap.type=T.PCFSoftShadowMap;pr.localClippingEnabled=true;
pr.outputEncoding=T.sRGBEncoding;pview.insertBefore(pr.domElement,pview.firstChild);
const sc=new T.Scene();sc.background=new T.Color(0x121820);
{const pm=new T.PMREMGenerator(pr),s=new T.Scene();const room=new T.Mesh(new T.BoxGeometry(30,14,30),new T.MeshBasicMaterial({color:0x272c33,side:T.BackSide}));room.position.y=6;s.add(room);
 for(let i=-2;i<=2;i++){const l=new T.Mesh(new T.PlaneGeometry(1.4,12),new T.MeshBasicMaterial({color:new T.Color(0xffffff).multiplyScalar(5),side:T.DoubleSide}));l.position.set(i*5,12.9,0);l.rotation.x=Math.PI/2;s.add(l);}
 sc.environment=pm.fromScene(s,0.04).texture;pm.dispose();}
sc.traverse(()=>{});
const cam=new T.PerspectiveCamera(32,1,0.02,50),ctl=new T.OrbitControls(cam,pr.domElement);ctl.enableDamping=true;ctl.minDistance=0.5;ctl.maxDistance=7;ctl.autoRotateSpeed=0.8;
const sun=new T.DirectionalLight(0xfff0da,1.8);sun.position.set(-2,4,3);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-1.8,right:1.8,top:1.8,bottom:-1.8,near:.5,far:12});sun.shadow.bias=-0.0005;sc.add(sun);
sc.add(new T.HemisphereLight(0xb9c6d4,0x1a1612,0.45));
{const f=mesh(new T.CircleGeometry(2.6,64),M.concrete,sc);f.rotation.x=-Math.PI/2;f.castShadow=false;}
const lay=$('plabels'),tv=new T.Vector3();let cur=null,pid=null,spin=!reduce,lblOn=true,vis=true,t0=0;
ctl.addEventListener('start',()=>{ctl.autoRotate=false;});
function show(id){pid=id;const P=PRODUCTS.find(p=>p.id===id);
  document.querySelectorAll('.pbtn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===id));
  if(cur){sc.remove(cur.root);cur.root.traverse(n=>{if(n.geometry&&n.geometry!==HEX)n.geometry.dispose();});}
  const b=P.build();cur=b;sc.add(b.root);
  lay.innerHTML='';cur.lbls=b.parts.map(q=>{const el=document.createElement('div');el.className='lbl pu';el.textContent=q.t;lay.appendChild(el);return{el,p:q.p};});
  const VC={z_pus:[[0.9,0.9,1.5],[0,0.3,0]],z_puc:[[0.9,0.9,1.5],[0,0.3,0]],z_dual:[[-1.1,0.8,1.0],[0,0.35,0]],z_rail:[[1.1,0.8,1.1],[0,0.18,0]],z_snap:[[1.1,1.0,1.4],[0,0.35,0]],z_block:[[1.6,1.4,1.4],[0,0.4,0]],z_nc:[[0.25,0.75,2.1],[0,0.55,0]],z_cover:[[2.2,1.6,2.2],[0,0.4,0]],z_bar:[[1.4,1.0,1.4],[0,0.3,0]]};
  const v=VC[id]||[[1.9,1.5,2.1],[0,0.4,0]];cam.position.set(...v[0]);ctl.target.set(...v[1]);ctl.autoRotate=spin;
  $('pName').textContent=P.name;$('pRef').textContent='Каталог · раздел '+(P.step===2?'02':'03')+' · '+P.grp.toLowerCase();
  $('pDesc').textContent=b.desc;$('pAdv').textContent=b.adv;
  $('pParts').innerHTML='';b.list.forEach(s=>{const li=document.createElement('li');li.textContent=s;$('pParts').appendChild(li);});
  $('pSel').innerHTML='';b.sel.forEach(s=>{const sp=document.createElement('span');sp.textContent=s;$('pSel').appendChild(sp);});
}
{const nav=$('plist');let last='';
 for(const p of PRODUCTS){if(p.grp!==last){const g=document.createElement('div');g.className='grp';g.textContent=p.grp;nav.appendChild(g);last=p.grp;}
  const b=document.createElement('button');b.className='pbtn';b.dataset.p=p.id;b.setAttribute('aria-pressed','false');
  const bb=document.createElement('b');bb.textContent=p.name;const sp=document.createElement('span');sp.textContent=p.short;b.append(bb,sp);b.addEventListener('click',()=>show(p.id));nav.appendChild(b);}}
$('pLbl').onclick=()=>{lblOn=!lblOn;$('pLbl').setAttribute('aria-pressed',lblOn);};
$('pSpin').onclick=()=>{spin=!spin;$('pSpin').setAttribute('aria-pressed',spin);ctl.autoRotate=spin;};$('pSpin').setAttribute('aria-pressed',spin);
$('pUse').onclick=()=>{const P=PRODUCTS.find(p=>p.id===pid);const b=document.querySelector('.mode[data-mode="'+P.step+'"]');if(b)b.click();const v=$('view');if(v&&v.scrollIntoView)v.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});};
if(window.IntersectionObserver)new IntersectionObserver(es=>{vis=es[0].isIntersecting;}).observe(pview);
function resize(){const w=pview.clientWidth,h=pview.clientHeight;pr.setSize(w,h,false);cam.aspect=w/(h||1);cam.updateProjectionMatrix();}
addEventListener('resize',resize);if(window.ResizeObserver)new ResizeObserver(resize).observe(pview);
function place(el,v,w,h){v.project(cam);if(v.z>1||Math.abs(v.x)>1.05||Math.abs(v.y)>1.05){el.hidden=true;return;}el.hidden=false;el.style.left=((v.x+1)/2*w).toFixed(1)+'px';el.style.top=((1-v.y)/2*h).toFixed(1)+'px';}
const clk=new T.Clock();
function tick(){requestAnimationFrame(tick);const dt=Math.min(.033,clk.getDelta());if(!vis||!cur)return;t0+=dt;
  if(cur.mid)cur.mid.position.y=-0.012*Math.max(0,Math.sin(t0*3))**6;
  ctl.update();pr.render(sc,cam);const w=pview.clientWidth,h=pview.clientHeight;
  for(const L of cur.lbls){if(!lblOn){L.el.hidden=true;continue;}tv.set(...L.p);cur.root.localToWorld(tv);place(L.el,tv,w,h);}}
window.LEGACY_CAT={page:'konveyer-udar.html',map:Object.fromEntries(PRODUCTS.map(p=>[p.id,[p.img,p.page]]))};
show('z_torsion');resize();tick();
})();
