/* Legacy · демпферный стол с торсионными опорами (тип Kinder K-Shield Dynamax).
   Геометрия по монтажным схемам KDOC00085 / KDOC00086 и фото производителя:
   – тяжёлые поперечины (транцы) с лапами на ставе конвейера;
   – на каждой поперечине по торсионной опоре с каждой стороны (синяя резина между красными рычагами);
   – подвижное гнутое корыто: центр + нижняя часть наклона, полки лежат на опорах;
   – брусья UHMWPE 30 мм на Т-болтах, заходная фаска на концах;
   – неподвижные крылья: стойки с коленом, наклонная плита с отогнутой кромкой, свои брусья под бортами течки.
   Начало координат: середина стола, y = 0 — верх центральных брусьев; x — вдоль ленты, z — поперёк.
   Лента 1200 мм, желоб 35°, центральная часть 400 мм. */
(function(){
'use strict';
function build(T,o){
  o=o||{};
  const L=o.L||1.4, A=35*Math.PI/180, C=Math.cos(A), S=Math.sin(A), R=window.LegacyRealism;
  const std=p=>{const m=new T.MeshStandardMaterial(p);m.color.convertSRGBToLinear();return m;};
  const MAT=o.mat||{};
  const galv=MAT.galv||std({color:0xc9cfd4,roughness:.34,metalness:.85});
  const rail=MAT.rail||std({color:0x8a1812,roughness:.58,metalness:0});
  const arm=MAT.arm||std({color:0xc8281e,roughness:.42,metalness:.25});
  const rub=MAT.rubber||std({color:0x24509c,roughness:.6,metalness:.05});
  const bolt=MAT.bolt||std({color:0xb9c0c6,roughness:.3,metalness:1});
  const rubDark=std({color:0x16181a,roughness:.9});
  if(R&&R.triplanar&&!MAT.galv){galv.roughnessMap=R.tex(T,'galv_r.jpg');galv.roughness=0.75;R.triplanar(galv,3,false);}
  const root=new T.Group(),base=new T.Group(),trough=new T.Group(),wingL=new T.Group(),wingR=new T.Group(),bars=new T.Group();
  root.add(base,trough,wingL,wingR);trough.add(bars);
  function mesh(g,m,p,x,y,z){const q=new T.Mesh(g,m);q.castShadow=q.receiveShadow=true;if(x!==undefined)q.position.set(x,y,z);p.add(q);return q;}
  function box(w,h,d,m,p,x,y,z){return mesh(new T.BoxGeometry(w,h,d),m,p,x,y,z);}
  /* closed (z,y) section extruded along x, centred */
  function extr(pts,len,m,p,x){const s=new T.Shape();const q=pts.map(a=>[-a[0],a[1]]);s.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)s.lineTo(q[i][0],q[i][1]);s.closePath();
    const g=new T.ExtrudeGeometry(s,{depth:len,bevelEnabled:false});g.translate(0,0,-len/2);g.rotateY(Math.PI/2);g.computeVertexNormals();
    const r=mesh(g,m,p);r.position.x=x||0;return r;}
  /* polyline offset to the "down" side (direction of travel left→right) */
  function offs(P,t){const n=[];for(let i=0;i<P.length-1;i++){const dz=P[i+1][0]-P[i][0],dy=P[i+1][1]-P[i][1],l=Math.hypot(dz,dy);n.push([dy/l,-dz/l]);}
    return P.map((p,i)=>{const a=n[Math.max(0,i-1)],b=n[Math.min(n.length-1,i)];let mz=a[0]+b[0],my=a[1]+b[1];const ml=Math.hypot(mz,my);mz/=ml;my/=ml;const k=t/(mz*b[0]+my*b[1]);return[p[0]+mz*k,p[1]+my*k];});}
  function plate(P,t,len,m,p,x){const B=offs(P,t);return extr(P.concat(B.reverse()),len,m,p,x);}
  /* hex bolts / nuts as one instanced mesh per group */
  const HEX=new T.CylinderGeometry(0.0115,0.0115,0.011,6);
  const pend=new Map();
  function nut(p,x,y,z,rx,rz){if(!pend.has(p))pend.set(p,[]);pend.get(p).push([x,y,z,rx||0,rz||0]);}
  function flushNuts(){const d=new T.Object3D();for(const[p,list]of pend){const im=new T.InstancedMesh(HEX,bolt,list.length);im.castShadow=true;
    list.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(q[3],0,q[4]);d.updateMatrix();im.setMatrixAt(i,d.matrix);});p.add(im);}}
  /* UHMWPE slider rail: 30 mm, chamfered top edges, lead-in bevel on both ends */
  function railGeo(len,w){const h=0.03,c=0.004,s=new T.Shape();
    s.moveTo(-w/2,-h);s.lineTo(w/2,-h);s.lineTo(w/2,-c);s.lineTo(w/2-c,0);s.lineTo(-w/2+c,0);s.lineTo(-w/2,-c);s.closePath();
    const g=new T.ExtrudeGeometry(s,{depth:len,bevelEnabled:false});g.translate(0,0,-len/2);g.rotateY(Math.PI/2);
    const a=g.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i);if(Math.abs(Math.abs(x)-len/2)<1e-4){a.setX(i,x-Math.sign(x)*0.028*(y+h)/h);}}
    g.computeVertexNormals();return g;}
  function railAt(p,len,w,z,y,rx){const r=mesh(railGeo(len,w),rail,p);r.position.set(0,y,z);r.rotation.x=rx||0;
    /* steel T-track insert visible at the bottom */
    const t=new T.Mesh(new T.BoxGeometry(len-0.06,0.006,w*0.34),bolt);t.position.set(0,-0.031,0);r.add(t);return r;}
  const Lr=L-0.012;
  /* ---- 1. slider rails on the dynamic trough: 4 in the centre, 2 on each incline ---- */
  const CB=[-0.15,-0.05,0.05,0.15];
  for(const z of CB)railAt(bars,Lr,0.094,z,0);
  for(const sg of[-1,1])for(const d of[0.05,0.15])railAt(bars,Lr,0.094,sg*(0.2+d*C),d*S,-sg*A);
  /* ---- 2. dynamic trough: bent plate 10 mm, flanges resting on the springs ---- */
  const y0=-0.03,dp=0.15,zi=0.2+dp*C,yf=y0+dp*S,zF=0.48,tp=0.01;
  const TP=[[-zF,yf],[-zi,yf],[-0.2,y0],[0.2,y0],[zi,yf],[zF,yf]];
  plate(TP,tp,L-0.01,galv,trough);
  const TB=offs(TP,tp);
  /* end stiffeners under the trough */
  for(const x of[-(L-0.01)/2+0.008,(L-0.01)/2-0.008]){const P=[TB[1],TB[2],TB[3],TB[4]];const yb=-0.095;
    extr([P[0],P[1],P[2],P[3],[P[3][0]-0.04,yb],[P[0][0]+0.04,yb]].reverse(),0.012,galv,trough,x);}
  /* T-bolt nuts under the trough along each rail */
  const nx=[];for(let k=0;k<5;k++)nx.push(-L/2+0.12+(L-0.24)*k/4);
  for(const x of nx){for(const z of CB)nut(trough,x,y0-tp-0.0055,z);
    for(const sg of[-1,1])for(const d of[0.05,0.13]){const z=sg*(0.2+d*C),y=y0+d*S-tp/C-0.004;nut(trough,x,y,z,-sg*A);}}
  /* ---- 3. transoms with feet, pedestals, torsion springs, fixed-wing posts ---- */
  const TX=[-(L/2-0.13),0,L/2-0.13],springs=[];
  const TR=[[-0.66,-0.11],[0.66,-0.11],[0.66,-0.17],[0.57,-0.29],[-0.57,-0.29],[-0.66,-0.17]];
  for(const x of TX){
    extr(TR.slice().reverse(),0.14,galv,base,x);
    for(const sg of[-1,1]){
      /* foot over the stringer: plate, two gussets, two bolts */
      box(0.24,0.014,0.16,galv,base,x,-0.123,sg*0.73);
      for(const gx of[-0.055,0.055]){const G=[[0.66,-0.13],[0.78,-0.13],[0.66,-0.205]].map(p=>[sg*p[0],p[1]]);extr(sg>0?G.reverse():G,0.012,galv,base,x+gx);}
      for(const bx of[-0.08,0.08])nut(base,x+bx,-0.111,sg*0.745);
      /* pedestal + spring base plate */
      const zs=sg*0.42;
      box(0.16,0.02,0.13,galv,base,x,-0.10,zs);
      box(0.22,0.012,0.16,galv,base,x,-0.084,zs);
      for(const bx of[-0.09,0.09])for(const bz of[-0.06,0.06])nut(base,x+bx,-0.0725,zs+bz);
      /* lower torsion element: blue rubber in a galvanised V-seat */
      const P0=[x-0.045,-0.038],P1=[x+0.045,-0.006];
      box(0.085,0.024,0.13,galv,base,P0[0],-0.066,zs);
      const lo=box(0.056,0.056,0.112,rub,base,P0[0],P0[1],zs);lo.rotation.z=Math.PI/4;
      box(0.026,0.026,0.15,galv,base,P0[0],P0[1],zs).rotation.z=Math.PI/4;
      /* upper torsion element on the trough flange */
      box(0.22,0.012,0.16,galv,trough,x,yf-tp-0.006,zs);
      box(0.085,0.022,0.13,galv,trough,P1[0],yf-tp-0.023,zs);
      const up=box(0.056,0.056,0.112,rub,trough,P1[0],P1[1],zs);up.rotation.z=Math.PI/4;
      box(0.026,0.026,0.15,galv,trough,P1[0],P1[1],zs).rotation.z=Math.PI/4;
      for(const bx of[-0.09,0.09])for(const bz of[-0.06,0.06])nut(trough,x+bx,yf+0.0055,zs+bz);
      /* red crank plates on both faces, pivoting about the lower element */
      const g=new T.Group();g.position.set(P0[0],P0[1],zs);base.add(g);
      const l=Math.hypot(P1[0]-P0[0],P1[1]-P0[1]),r=0.038,sh=new T.Shape();
      sh.moveTo(0,-r);sh.lineTo(l,-r);sh.absarc(l,0,r,-Math.PI/2,Math.PI/2,false);sh.lineTo(0,r);sh.absarc(0,0,r,Math.PI/2,Math.PI*1.5,false);
      const ag=new T.ExtrudeGeometry(sh,{depth:0.012,bevelEnabled:true,bevelThickness:0.002,bevelSize:0.002,bevelSegments:1,curveSegments:10});
      for(const f of[-1,1]){const pm=mesh(ag,arm,g);pm.position.z=f*0.064-0.006;
        for(const[bx,by]of[[-0.012,0.016],[0.014,-0.014],[l-0.014,0.014],[l+0.012,-0.016]])nut(g,bx,by,f*0.077,Math.PI/2);}
      const a0=Math.atan2(P1[1]-P0[1],P1[0]-P0[0]);g.rotation.z=a0;
      springs.push({g,P0,P1,a0});
      /* fixed-wing post: base plate, upright, knee under the wing plate */
      const zp=sg*0.57;
      box(0.15,0.012,0.15,galv,base,x,-0.104,zp);
      for(const bx of[-0.055,0.055])nut(base,x+bx,-0.092,zp+sg*0.05);
      box(0.08,0.29,0.08,galv,base,x,0.047,zp);
      const kn=box(0.08,0.05,0.24,galv,base,x,0,0);const dk=0.38;
      kn.position.set(x,0.01+dk*S-0.03-0.035*C,sg*(0.2+dk*C+0.035*S));kn.rotation.x=-sg*A;
    }
  }
  /* ---- 4. fixed wings: inclined plate with turned-down edge, two rails each ---- */
  for(const[g,sg]of[[wingL,-1],[wingR,1]]){
    const P=[];for(const d of[0.2,0.48])P.push([0.2+d*C,0.01+d*S-0.03]);
    const e=P[1];P.push([e[0]+0.018,e[1]-0.012],[e[0]+0.024,e[1]-0.06]);
    const Pm=P.map(p=>[sg*p[0],p[1]]);plate(sg>0?Pm:Pm.slice().reverse().map(p=>p),0.01,L,galv,g);
    for(const d of[0.265,0.385])railAt(g,Lr,0.115,sg*(0.2+d*C),0.01+d*S,-sg*A);
    for(const x of TX)for(const bx of[-0.035,0.035]){const d=0.462;nut(g,x+bx,0.01+d*S-0.03+0.0055*C,sg*(0.2+d*C)-sg*0.0055*S,-sg*A);}
  }
  flushNuts();
  /* ---- travel: trough moves down, crank plates follow ---- */
  function setTravel(dy){trough.position.y=dy;for(const s of springs){s.g.rotation.z=Math.atan2(s.P1[1]+dy-s.P0[1],s.P1[0]-s.P0[0]);}}
  return{root,base,trough,bars,wingL,wingR,springs,setTravel,L,transoms:TX};
}
window.LegacyDynamax={build};
})();
