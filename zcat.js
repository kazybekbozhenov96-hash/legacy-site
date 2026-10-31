/* Legacy · «Зона загрузки» — product catalogue with its own 3D viewer (sections 02–03) */
(function(){
"use strict";
if(!window.THREE||!THREE.OrbitControls)return;
const $=id=>document.getElementById(id),pview=$('pview');if(!pview)return;
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const T=THREE,R=window.LegacyRealism;
const tex=(n,s,rep)=>R?R.tex(T,n,s,rep):null;
function std(o){return new T.MeshStandardMaterial(o);}
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
if(R){M.paint.map=tex('paint_c.jpg',true);M.paint.color.set(0x35526d);M.galv.map=tex('galv_c.jpg',true);M.shell.map=tex('shell_c.jpg',true);
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
/* ---------- builders ---------- */
function bars(p,x0,x1,y,mat){const C=Math.cos(TR),S=Math.sin(TR);
  box(x1-x0,0.045,0.1,mat,p,(x0+x1)/2,y-0.0225,0);for(const z of[-0.12,0.12])box(x1-x0,0.045,0.1,mat,p,(x0+x1)/2,y-0.0225,z);
  for(const sg of[-1,1])for(const k of[0.06,0.18,0.3]){const b=box(x1-x0,0.045,0.1,mat,p,(x0+x1)/2,y+k*S-0.0225*C,sg*(0.2+k*C+0.0225*S));b.rotation.x=-sg*TR;}}
function buildStation(){const g=new T.Group(),L=1.5,y=0.62;
  bars(g,-L/2,L/2,y,M.rubber);
  for(const x of[-L/2+0.1,0,L/2-0.1]){box(0.08,0.05,1.0,M.paint,g,x,y-0.12,0);for(const sg of[-1,1])box(0.06,y-0.15,0.06,M.paint,g,x,(y-0.15)/2,sg*0.5);}
  for(const sg of[-1,1])box(L+0.1,0.06,0.06,M.paint,g,0,y-0.25,sg*0.5);
  ghostBelt(g,L+0.4,y);
  return{root:g,parts:[{t:'Амортизирующие балки',p:[0.3,y,0]},{t:'Опорные поперечины',p:[-0.75,y-0.12,0.4]},{t:'Стойки станции',p:[0,0.25,0.5]}],
   list:['Амортизирующие балки по профилю желоба','Опорные поперечины и стойки','Монтаж на став в зоне загрузки'],
   desc:'Поглощают ударные нагрузки при падении транспортируемого материала на ленту в зонах загрузки и перегрузки. Защищают ленту от механических повреждений, снижают динамические нагрузки.',adv:'Распределяют воздействие падающего материала по опорному участку и ограничивают прогиб ленты.',
   sel:['Высота падения','Масса и размер куска','Производительность','Ширина и скорость ленты','Угол желоба']};}
function buildBar(){const g=new T.Group(),L=1.4;
  box(L,0.03,0.1,M.uhmw,g,0,0.45,0);box(L,0.05,0.1,M.rubber,g,0,0.41,0);box(L,0.02,0.1,M.steel,g,0,0.375,0);
  for(let x=-0.6;x<=0.61;x+=0.3){const h=mesh(new T.CylinderGeometry(0.008,0.008,0.07,8),M.shaft,g,x,0.395,0);mesh(new T.CylinderGeometry(0.018,0.018,0.01,6),M.shaft,g,x,0.358,0);}
  const g2=new T.Group();g2.position.set(0,0,0.32);g.add(g2);box(L,0.1,0.1,M.rubber,g2,0,0.42,0);box(L,0.02,0.1,M.steel,g2,0,0.36,0);
  return{root:g,parts:[{t:'Слой скольжения UHMWPE',p:[0.4,0.47,0]},{t:'Резиновый амортизирующий слой',p:[-0.4,0.41,0.06]},{t:'Стальная полка с крепёжом',p:[-0.4,0.37,-0.06]},{t:'Резиновая балка',p:[0.3,0.43,0.32]}],
   list:['Слой скольжения из UHMWPE или резины','Амортизирующий слой','Стальная монтажная полка с болтами в Т-пазах'],
   desc:'Сменные опорные элементы из резины, UHMWPE или композитов. Сочетают скольжение и амортизацию в зависимости от конструкции. Подбор по нагрузке, длине участка и температуре.',adv:'Сменные балки позволяют обновлять изношенные элементы без замены всей рамы.',
   sel:['Нагрузка','Длина участка','Температура','Ширина ленты']};}
function buildCombo(){const g=new T.Group(),y=0.62;
  idlerSet(g,-0.45,y);idlerSet(g,0.45,y);
  const C=Math.cos(TR),S=Math.sin(TR);
  for(const sg of[-1,1]){const b=box(1.4,0.045,0.1,M.uhmw,g,0,y+0.33*S-0.0225*C,sg*(0.2+0.33*C+0.0225*S));b.rotation.x=-sg*TR;
    const r=box(1.4,0.03,0.04,M.steel,g,0,y+0.33*S-0.06,sg*(0.2+0.33*C+0.06));r.rotation.x=-sg*TR;
    box(0.04,0.04,0.25,M.galv,g,0.75,y-0.05,sg*0.55);}
  ghostBelt(g,1.7,y);
  return{root:g,parts:[{t:'Ролики в центре',p:[0.45,y-0.06,0]},{t:'Опорные брусья у бортов',p:[0,y+0.2,0.48]},{t:'Выдвижная секция',p:[0.75,y-0.05,0.55]}],
   list:['Роликоопоры поддерживают центр ленты','Опорные брусья у бортов держат кромку под уплотнениями','Регулируемые и выдвижные секции для обслуживания'],
   desc:'Ролики и опорные брусья поддерживают ленту в зоне пересыпа. Доступны регулируемые и выдвижные конструкции для обслуживания.',adv:'Сочетают поддержку ленты у бортов с качением на роликах; выдвижные секции облегчают доступ.',
   sel:['Ширина ленты','Угол желоба','Шаг опор','Доступ для обслуживания']};}
function buildTorsion(){const g=new T.Group(),L=1.4,y=0.62;const mid=new T.Group();g.add(mid);
  const C=Math.cos(TR),S=Math.sin(TR);
  for(const z of[-0.12,0,0.12])box(L,0.045,0.08,M.uhmw,mid,0,y-0.0225,z);
  box(L,0.03,0.42,M.steel,mid,0,y-0.06,0);
  for(const x of[-0.5,0,0.5])for(const sg of[-1,1]){const t=new T.Group();t.position.set(x,y-0.2,sg*0.28);g.add(t);
    const hous=box(0.14,0.14,0.14,M.paint,t,0,0,0);const core=mesh(new T.BoxGeometry(0.09,0.09,0.15),M.rubber,t);core.rotation.z=Math.PI/4;
    box(0.035,0.012,0.16,M.pu,t,0,0.075,0);const arm=box(0.035,0.14,0.02,M.steel,t,0,0.1,-sg*0.08);
    box(0.06,y-0.27,0.06,M.paint,g,x,(y-0.27)/2,sg*0.28);}
  for(const sg of[-1,1]){for(const k of[0.12,0.26]){const b=box(L,0.045,0.08,M.uhmw,g,0,y+k*S-0.0225*C,sg*(0.2+k*C+0.0225*S));b.rotation.x=-sg*TR;}
    const f=box(L,0.06,0.06,M.paint,g,0,y+0.15*S-0.09,sg*(0.2+0.2*C+0.05));
    for(const x of[-0.6,0.6])box(0.06,y+0.1,0.06,M.paint,g,x,(y+0.1)/2-0.05,sg*0.62);}
  ghostBelt(g,L+0.4,y);
  return{root:g,mid,parts:[{t:'Центральная секция на торсионах',p:[0.3,y,0]},{t:'Торсионная опора',p:[-0.5,y-0.2,0.36]},{t:'Боковые неподвижные секции',p:[0.4,y+0.15,0.5]},{t:'Брусья UHMWPE',p:[-0.4,y,-0.1]}],
   list:['Центральная секция подвешена на каучуковых торсионных демпферах','Боковые секции закреплены неподвижно под бортовыми уплотнениями','Направляющие из UHMWPE — поверхность скольжения без вращающихся узлов'],
   desc:'Для зоны приёма материала с высокими ударными нагрузками. При падении материала упругие каучуковые элементы деформируются в торсионных опорах, центральная секция получает упругий ход и гасит колебания.',adv:'По данным каталога увеличивает срок службы ленты на 30 % и снижает риск аварийного простоя.',
   sel:['Высота падения','Масса и максимальный размер куска','Производительность','Ширина и скорость ленты','Угол желоба','Монтажная высота']};}
/* seals: shown in cross-section with chute wall and belt edge */
function wallCtx(g,ext){box(0.012,0.4,1.3,M.steel,g,0,0.45,0);for(let z=-0.6;z<=0.61;z+=0.3)box(0.05,0.36,0.03,M.steel,g,0.03,0.45,z);
  const belt=box(0.5,0.012,1.4,M.belt,g,-0.05,0.2,0);belt.rotation.z=-0.2;belt.castShadow=false;}
function buildPuSteel(cer){const g=new T.Group();wallCtx(g);
  box(0.006,0.16,1.22,M.steel,g,-0.012,0.33,0);box(0.019,0.16,1.22,M.pu,g,-0.028,0.33,0);
  if(cer)for(let i=0;i<14;i++)for(let j=0;j<3;j++)box(0.012,0.042,0.075,M.ceramic,g,-0.044,0.28+j*0.048,-0.55+i*0.085);
  for(let z=-0.5;z<=0.51;z+=0.25){box(0.03,0.02,0.05,M.galv,g,0.03,0.38,z);bolt(g,0.05,0.38,z,'x');}
  return{root:g,parts:[{t:cer?'Керамика 92 % Al₂O₃':'Полиуретан 19 мм',p:[-0.04,0.36,0.3]},{t:'Стальная основа 6 мм',p:[-0.012,0.42,-0.4]},{t:'Пазы для регулировки',p:[0.05,0.38,0.5]},{t:'Стенка течки',p:[0.01,0.6,-0.6]}],
   list:cer?['Керамические элементы 13 мм (92 % Al₂O₃)','Полиуретановая основа 6 мм','Стальная подложка 6 мм','Секции 1219 / 1524 × 178 × 25 мм']:['Полиуретановый рабочий слой 19 мм','Стальная основа 6 мм','Продолговатые отверстия для регулировки','Секции 1219 / 1524 × 178 × 25 мм'],
   desc:cer?'Внутреннее уплотнение для защиты от абразивного износа: керамические элементы на полиуретановой основе и стальной подложке.':'Внутреннее уплотнение течки. Ставится со стороны потока, удерживает основной материал и разгружает наружный фартук.',
   adv:cer?'Керамика защищает зону контакта от абразивного износа, а полиуретановая основа поддерживает вставки.':'Принимает воздействие потока и защищает наружный фартук; крепёжные пазы упрощают регулировку.',
   sel:['Толщина стенки течки','Зазор до ленты','Длина уплотнения','Крупность и абразивность материала']};}
function buildDual(){const g=new T.Group();wallCtx(g);
  const s=new T.Shape();s.moveTo(0,0);s.lineTo(0.02,0);s.lineTo(0.02,0.16);s.lineTo(0.08,0.06);s.lineTo(0.1,0.07);s.lineTo(0.03,0.2);s.lineTo(0,0.2);s.closePath();
  const p=new T.ExtrudeGeometry(s,{depth:1.2,bevelEnabled:false});p.translate(0,0,-0.6);p.rotateY(0);const m=mesh(p,M.pu,g,0.012,0.2,0);m.rotation.y=Math.PI;m.position.x=0.03;
  box(0.012,0.06,1.22,M.galv,g,0.025,0.42,0);for(let z=-0.5;z<=0.51;z+=0.25)bolt(g,0.035,0.42,z,'x');
  return{root:g,parts:[{t:'Основная кромка',p:[0.015,0.24,0.3]},{t:'Второй контур',p:[-0.06,0.27,-0.2]},{t:'Прижимная планка',p:[0.03,0.43,0.5]}],
   list:['Цельнолитой полиуретановый профиль','Основная кромка удерживает материал','Эластичный фартук — вторая линия уплотнения','Монтаж снаружи течки с регулировкой'],
   desc:'Основная кромка удерживает материал, а эластичный фартук образует вторую линию уплотнения. Устанавливается снаружи течки с возможностью регулировки и замены.',adv:'Вторая кромка ограничивает выход мелочи и пыли за основной контур.',sel:['Толщина стенки течки','Зазор до ленты','Скорость и температура','Длина уплотнения']};}
function buildRail(snap){const g=new T.Group();wallCtx(g);
  box(0.02,0.08,1.22,M.galv,g,0.03,0.4,0);for(let z=-0.5;z<=0.51;z+=0.25)bolt(g,0.045,0.4,z,'x');
  const h=snap?0.2:0.16;const prof=box(0.012,h,1.2,snap?M.pu:M.puSoft,g,0.02,0.4-h/2-0.03,0);prof.rotation.z=-0.25;
  if(snap)for(let z=-0.55;z<=0.56;z+=0.22)box(0.03,0.03,0.05,M.steel,g,0.045,0.42,z);
  return{root:g,parts:[{t:snap?'Профиль K-Snap-Loc':'Полиуретановый профиль',p:[-0.02,0.27,0.3]},{t:'Монтажная рейка',p:[0.04,0.42,-0.4]},{t:snap?'Фиксаторы':'Крепёж',p:[0.05,0.43,0.5]}],
   list:snap?['Гибкий полиуретановый профиль 127 / 150 / 230 / 355 мм','Защёлкивается в монтажную рейку длиной 2000 мм','Фиксирующие элементы','Составы R69 (−30…+80 °C) и B93 (−25…+120 °C)']:['Полиуретановые профили','Монтажная рейка','Фиксация позволяет менять изношенный участок'],
   desc:snap?'Гибкий полиуретановый профиль закрывает зазор между стенкой течки и лентой. Уплотнение защёлкивается в монтажную рейку и удерживается фиксирующими элементами.':'Полиуретановые профили для контактного уплотнения зоны пересыпа. Крепление на рейке и фиксация позволяют менять изношенный участок.',
   adv:snap?'Защёлкивающееся крепление упрощает замену изношенного профиля без разборки стенки течки.':'Позволяют заменить изношенный участок и восстановить положение уплотнения.',sel:['Высота профиля','Зазор до ленты','Скорость ленты','Температура']};}
function buildBlock(){const g=new T.Group();wallCtx(g);
  for(let i=0;i<6;i++){const z=-0.5+i*0.2;box(0.06,0.14,0.19,M.pu,g,-0.03,0.3,z);box(0.02,0.1,0.19,M.steel,g,0.02,0.32,z);bolt(g,0.035,0.32,z,'x');}
  box(0.02,0.04,1.22,M.galv,g,0.03,0.42,0);
  return{root:g,parts:[{t:'Сменные блоки',p:[-0.04,0.36,0.3]},{t:'Прижимные пластины',p:[0.02,0.36,-0.3]}],
   list:['Сменные полиуретановые блоки','Прижимные пластины','Для боковых и задней стенок загрузочного узла'],
   desc:'Для самых тяжёлых условий. Сменные элементы для боковых и задней стенок загрузочного узла. Прижимные пластины и опоры под лентой подбирают совместно с уплотнением.',adv:'Закрывают боковые и задние зоны просыпи; отдельные блоки можно заменять по износу.',sel:['Геометрия загрузочного узла','Нагрузка','Крупность материала']};}
function buildCover(){const g=new T.Group(),L=1.6,R=0.55;
  const c=new T.CylinderGeometry(R,R,L,40,1,true,0,Math.PI);c.rotateZ(Math.PI/2);const m=mesh(c,M.fabric,g,0,0.55,0);
  for(let x=-L/2;x<=L/2+0.01;x+=0.4){const a=new T.TorusGeometry(R+0.005,0.012,6,24,Math.PI);const t=mesh(a,M.galv,g,x,0.55,0);t.rotation.y=Math.PI/2;}
  for(const sg of[-1,1])box(L,0.04,0.04,M.galv,g,0,0.55,sg*R);
  for(let z=-0.4;z<=0.41;z+=0.08)box(0.01,0.3,0.07,M.rubber,g,L/2+0.01,0.42,z);
  ghostBelt(g,L+0.3,0.3);
  return{root:g,parts:[{t:'Фильтрующее полотно',p:[0,1.05,0]},{t:'Дуги каркаса',p:[-0.4,0.9,0.4]},{t:'Шторка на выходе',p:[0.8,0.45,0.2]}],
   list:['Воздухопроницаемое полотно над лентой','Дуговой каркас','Шторка на выходе','Работает вместе с бортовыми уплотнениями'],
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
 {id:'z_cover',grp:'Дополнительная пылезащита',name:'Фильтрующее укрытие',short:'Пыль внутри, воздух наружу',build:buildCover,step:4,img:45,page:'konveyer-uplotneniya.html'}
];
/* ---------- viewer ---------- */
let pr;try{pr=new T.WebGLRenderer({antialias:true});}catch(e){return;}
pr.setPixelRatio(Math.min(2,window.devicePixelRatio||1));pr.shadowMap.enabled=true;pr.shadowMap.type=T.PCFSoftShadowMap;pr.localClippingEnabled=true;
pr.outputEncoding=T.sRGBEncoding;pr.toneMapping=T.ACESFilmicToneMapping;pview.insertBefore(pr.domElement,pview.firstChild);
const sc=new T.Scene();sc.background=new T.Color(0x121820);
{const pm=new T.PMREMGenerator(pr),s=new T.Scene();const room=new T.Mesh(new T.BoxGeometry(30,14,30),new T.MeshBasicMaterial({color:0x272c33,side:T.BackSide}));room.position.y=6;s.add(room);
 for(let i=-2;i<=2;i++){const l=new T.Mesh(new T.PlaneGeometry(1.4,12),new T.MeshBasicMaterial({color:new T.Color(0xffffff).multiplyScalar(5),side:T.DoubleSide}));l.position.set(i*5,12.9,0);l.rotation.x=Math.PI/2;s.add(l);}
 sc.environment=pm.fromScene(s,0.04).texture;pm.dispose();}
const cam=new T.PerspectiveCamera(32,1,0.02,50),ctl=new T.OrbitControls(cam,pr.domElement);ctl.enableDamping=true;ctl.minDistance=0.5;ctl.maxDistance=7;ctl.autoRotateSpeed=0.8;
const sun=new T.DirectionalLight(0xfff0da,2.0);sun.position.set(-2,4,3);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-1.8,right:1.8,top:1.8,bottom:-1.8,near:.5,far:12});sun.shadow.bias=-0.0005;sc.add(sun);
sc.add(new T.HemisphereLight(0xb9c6d4,0x1a1612,0.35));
{const f=mesh(new T.CircleGeometry(2.6,64),M.concrete,sc);f.rotation.x=-Math.PI/2;f.castShadow=false;}
const lay=$('plabels'),tv=new T.Vector3();let cur=null,pid=null,spin=!reduce,lblOn=true,vis=true,t0=0;
ctl.addEventListener('start',()=>{ctl.autoRotate=false;});
function show(id){pid=id;const P=PRODUCTS.find(p=>p.id===id);
  document.querySelectorAll('.pbtn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===id));
  if(cur){sc.remove(cur.root);cur.root.traverse(n=>{if(n.geometry&&n.geometry!==HEX)n.geometry.dispose();});}
  const b=P.build();cur=b;sc.add(b.root);
  lay.innerHTML='';cur.lbls=b.parts.map(q=>{const el=document.createElement('div');el.className='lbl pu';el.textContent=q.t;lay.appendChild(el);return{el,p:q.p};});
  const seal=P.step===3;cam.position.set(seal?-1.3:1.9,seal?1.0:1.5,seal?1.5:2.1);ctl.target.set(seal?0:0,seal?0.33:0.5,0);ctl.autoRotate=spin;
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
