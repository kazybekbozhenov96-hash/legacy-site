/* Legacy · демпферные станции по каталогу Hanpeng (тип HP-HCZ и HP-HCK).
   HCZ «Демпферная станция» (фото 29): поперечные рамы-«домики» из квадратной трубы, гнутые ложементы,
     синие резиновые амортизаторы под ложементом, продольная балка 150H по центру, лапы на став.
   HCK «Регулируемая станция» (фото 31): коробчатая центральная рама, крылья на шарнирах,
     подкосы с рядом отверстий под угол желоба 20/30/35/45°, боковые косынки с лапами.
   Брусья HP-H: красный UHMWPE 12,5 мм, чёрная резина, алюминиевый Т-профиль; ширина 100 мм, высота 75 мм.
   Начало координат: середина станции, y = 0 — верх центральных брусьев; x — вдоль ленты, z — поперёк.
   Лента 1200 мм, желоб 35°, центральная часть 400 мм. */
(function(){
'use strict';
const A=35*Math.PI/180,C=Math.cos(A),S=Math.sin(A),HB=0.075;
function kit(T,o){
  const R=window.LegacyRealism;
  const std=p=>{const m=new T.MeshStandardMaterial(p);m.color.convertSRGBToLinear();return m;};
  const M=Object.assign({
    paint:std({color:0xb8703e,roughness:.55,metalness:.2}),
    red:std({color:0x8a1812,roughness:.5,metalness:0}),
    black:std({color:0x141516,roughness:.88}),
    alu:std({color:0xb5bcc2,roughness:.35,metalness:.9}),
    blue:std({color:0x1f3f9e,roughness:.55,metalness:.15}),
    bolt:std({color:0x2a2c2f,roughness:.4,metalness:.8})
  },o&&o.mat||{});
  if(R&&R.triplanar&&!(o&&o.mat&&o.mat.paint)){M.paint.roughnessMap=R.tex(T,'paint_r.jpg');M.paint.roughness=0.85;R.triplanar(M.paint,2.5,false);}
  function mesh(g,m,p,x,y,z){const q=new T.Mesh(g,m);q.castShadow=q.receiveShadow=true;if(x!==undefined)q.position.set(x,y,z);p.add(q);return q;}
  function box(w,h,d,m,p,x,y,z){return mesh(new T.BoxGeometry(w,h,d),m,p,x,y,z);}
  function shapeOf(pts,holes){const s=new T.Shape();const q=pts.map(a=>[-a[0],a[1]]);s.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)s.lineTo(q[i][0],q[i][1]);s.closePath();
    (holes||[]).forEach(h=>{const p=new T.Path();p.absarc(-h[0],h[1],h[2],0,Math.PI*2,true);s.holes.push(p);});return s;}
  /* closed (z,y) section extruded along x, centred at x */
  function extr(pts,len,m,p,x,holes){const g=new T.ExtrudeGeometry(shapeOf(pts,holes),{depth:len,bevelEnabled:false,curveSegments:12});g.translate(0,0,-len/2);g.rotateY(Math.PI/2);g.computeVertexNormals();
    const r=mesh(g,m,p);r.position.x=x||0;return r;}
  function offs(P,t){const n=[];for(let i=0;i<P.length-1;i++){const dz=P[i+1][0]-P[i][0],dy=P[i+1][1]-P[i][1],l=Math.hypot(dz,dy);n.push([dy/l,-dz/l]);}
    return P.map((p,i)=>{const a=n[Math.max(0,i-1)],b=n[Math.min(n.length-1,i)];let mz=a[0]+b[0],my=a[1]+b[1];const ml=Math.hypot(mz,my);mz/=ml;my/=ml;const k=t/(mz*b[0]+my*b[1]);return[p[0]+mz*k,p[1]+my*k];});}
  function plate(P,t,len,m,p,x){const B=offs(P,t);return extr(P.concat(B.reverse()),len,m,p,x);}
  /* box between two (z,y) points, thickness th, x-width w */
  function strut(p,x,a,b,th,w,m){const dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy);const q=box(w,th,l,m,p,x,(a[1]+b[1])/2,(a[0]+b[0])/2);q.rotation.x=-Math.atan2(dy,dz);return q;}
  /* instanced hex bolts */
  const HEX=new T.CylinderGeometry(0.012,0.012,0.012,6),pend=new Map();
  function nut(p,x,y,z,rx,rz){if(!pend.has(p))pend.set(p,[]);pend.get(p).push([x,y,z,rx||0,rz||0]);}
  function flush(){const d=new T.Object3D();for(const[p,l]of pend){const im=new T.InstancedMesh(HEX,M.bolt,l.length);im.castShadow=true;
    l.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(q[3],0,q[4]);d.updateMatrix();im.setMatrixAt(i,d.matrix);});p.add(im);}pend.clear();}
  /* HP-H impact bar: red UHMWPE 12.5 mm over black rubber, aluminium T-channel at the bottom */
  const barGeo={};
  function bar(p,len,w,z,y,rx){const k=len.toFixed(3)+'/'+w;
    if(!barGeo[k]){const c=0.004,t=0.0125,s=new T.Shape();s.moveTo(-w/2,-t);s.lineTo(w/2,-t);s.lineTo(w/2,-c);s.lineTo(w/2-c,0);s.lineTo(-w/2+c,0);s.lineTo(-w/2,-c);s.closePath();
      const top=new T.ExtrudeGeometry(s,{depth:len,bevelEnabled:false});top.translate(0,0,-len/2);top.rotateY(Math.PI/2);top.computeVertexNormals();
      const cw=w*0.62,ch=0.0125,cs=new T.Shape();cs.moveTo(-cw/2,0);cs.lineTo(cw/2,0);cs.lineTo(cw/2,-ch);cs.lineTo(cw*0.18,-ch);cs.lineTo(cw*0.18,-ch*0.45);cs.lineTo(-cw*0.18,-ch*0.45);cs.lineTo(-cw*0.18,-ch);cs.lineTo(-cw/2,-ch);cs.closePath();
      const ch3=new T.ExtrudeGeometry(cs,{depth:len,bevelEnabled:false});ch3.translate(0,0,-len/2);ch3.rotateY(Math.PI/2);ch3.computeVertexNormals();
      barGeo[k]={top,rub:new T.BoxGeometry(len,HB-0.0125-0.0125,w),ch:ch3};}
    const G=barGeo[k],g=new T.Group();g.position.set(0,y,z);g.rotation.x=rx||0;p.add(g);
    mesh(G.top,M.red,g);const r=mesh(G.rub,M.black,g);r.position.y=-0.0125-(HB-0.025)/2;const c=mesh(G.ch,M.alu,g);c.position.y=-HB+0.0125;return g;}
  return{M,mesh,box,extr,offs,plate,strut,nut,flush,bar};
}
const sideP=(sg,d,dy)=>[sg*(0.2+d*C),d*S+(dy||0)];

/* ================= HP-HCZ composite impact bed ================= */
function hcz(T,o){o=o||{};const L=o.L||1.4,K=kit(T,o),{M,box,plate,strut,nut,bar}=K;
  const root=new T.Group(),base=new T.Group(),trough=new T.Group(),bars=new T.Group();root.add(base,trough);trough.add(bars);
  const Lb=L-0.012,FX=[-(L/2-0.12),0,L/2-0.12];
  /* bars: 4 in the centre (100 mm, gaps ~20), 3 on each wing */
  for(const z of[-0.15,-0.05,0.05,0.15])bar(bars,Lb,0.094,z,0);
  for(const sg of[-1,1])for(const d of[0.06,0.19,0.32])bar(bars,Lb,0.1,sg*(0.2+d*C),d*S,-sg*A);
  /* bent saddle under the bars at every frame (50 mm deep, 90 mm wide) */
  const dE=0.4,SP=[[-(0.2+dE*C),-HB+dE*S],[-0.2,-HB],[0.2,-HB],[0.2+dE*C,-HB+dE*S]];
  const yb=z=>{const az=Math.abs(z);return az<=0.2?-HB-0.05:-HB+((az-0.2)/C)*S-0.05/C;};
  /* centre 150H beam along the belt */
  const yH=-0.29,H=0.15;
  box(L,0.01,0.15,M.paint,base,0,yH+H-0.005,0);box(L,0.01,0.15,M.paint,base,0,yH+0.005,0);box(L,H-0.02,0.008,M.paint,base,0,yH+H/2,0);
  for(const x of FX){
    plate(SP,0.05,0.09,M.paint,trough,x);
    for(const z of[-0.15,-0.05,0.05,0.15])nut(trough,x,-HB-0.056,z);
    /* transverse base beam between the stringers */
    box(0.1,0.1,1.32,M.paint,base,x,-0.34,0);
    for(const sg of[-1,1]){
      /* rubber damper under the saddle: bracket, blue body with ears, base plate, pedestal */
      const zd=sg*0.31,yt=yb(zd);
      box(0.16,0.014,0.15,M.paint,trough,x,yt-0.007,zd);box(0.05,0.02,0.15,M.paint,trough,x,yt+0.004,zd-sg*0.04);
      box(0.12,0.08,0.11,M.blue,base,x,yt-0.054,zd);box(0.18,0.016,0.13,M.blue,base,x,yt-0.022,zd);box(0.18,0.016,0.13,M.blue,base,x,yt-0.086,zd);
      for(const bx of[-0.075,0.075]){nut(base,x+bx,yt-0.012,zd);nut(base,x+bx,yt-0.096,zd);}
      box(0.17,0.014,0.15,M.paint,base,x,yt-0.101,zd);
      const ped=yt-0.108-(-0.29);box(0.1,ped,0.1,M.paint,base,x,-0.29+ped/2,zd);
      /* gable frame: outer post, inner post, mid tie, inclined top member under the saddle */
      const zo=sg*0.55,zi=sg*0.42,top=z=>yb(z)-0.012,to=yb(zo)-0.06;
      box(0.08,to+0.39,0.08,M.paint,base,x,(to-0.39)/2,zo);
      box(0.08,top(zi)-0.035+0.29,0.08,M.paint,base,x,(top(zi)-0.035-0.29)/2,zi);
      box(0.08,0.07,Math.abs(zo-zi),M.paint,base,x,-0.12,(zo+zi)/2);
      const d0=0.2,d1=0.42,pa=[sg*(0.2+d0*C),yb(sg*(0.2+d0*C))-0.047],pb=[sg*(0.2+d1*C),yb(sg*(0.2+d1*C))-0.047];strut(base,x,pa,pb,0.07,0.08,M.paint);
      /* foot over the stringer + clamp angle on its outer face */
      box(0.2,0.014,0.29,M.paint,base,x,-0.123,sg*0.665);box(0.2,0.12,0.012,M.paint,base,x,-0.19,sg*0.80);
      for(const bx of[-0.06,0.06])nut(base,x+bx,-0.111,sg*0.74);
    }
  }
  K.flush();
  function setTravel(dy){trough.position.y=dy;}
  return{root,base,trough,bars,setTravel,L};
}

/* ================= HP-HCK adjustable impact bed ================= */
function hck(T,o){o=o||{};const L=o.L||1.4,K=kit(T,o),{M,box,extr,plate,strut,nut,bar}=K;
  const root=new T.Group(),base=new T.Group(),trough=new T.Group(),bars=new T.Group();root.add(base,trough);trough.add(bars);
  const Lb=L-0.012,FX=[-0.525*L/1.4,-0.175*L/1.4,0.175*L/1.4,0.525*L/1.4];
  /* bars: 3 wide in the centre, 2 on each wing */
  for(const z of[-0.135,0,0.135])bar(bars,Lb,0.125,z,0);
  for(const sg of[-1,1])for(const d of[0.1,0.3])bar(bars,Lb,0.17,sg*(0.2+d*C),d*S,-sg*A);
  for(const x of FX){
    /* centre box frame: seat plate, two webs with lightening holes, bottom plate */
    box(0.12,0.012,0.54,M.paint,trough,x,-HB-0.006,0);
    for(const fx of[-0.045,0.045])extr([[-0.27,-0.087],[0.27,-0.087],[0.27,-0.28],[-0.27,-0.28]],0.012,M.paint,trough,x+fx,[[-0.12,-0.18,0.035],[0.12,-0.18,0.035]]);
    box(0.12,0.012,0.54,M.paint,trough,x,-0.286,0);
    for(const z of[-0.135,0,0.135])nut(trough,x,-HB-0.018,z);
    for(const sg of[-1,1]){
      /* wing arm: double plate, hinged at the box corner, wing seat on top */
      const AP=[];for(const d of[-0.03,0.47])AP.push(sideP(sg,d,-HB-0.012));
      for(const fx of[-0.045,0.045]){const P=sg>0?AP:AP.slice().reverse();const B=K.offs(P,0.085);extr(P.concat(B.reverse()),0.012,M.paint,trough,x+fx);}
      plate(sg>0?AP:AP.slice().reverse(),0.012,0.12,M.paint,trough,x);
      const hp=[sg*0.235,-0.13];nut(trough,x-0.054,hp[1],hp[0],0,Math.PI/2);nut(trough,x+0.054,hp[1],hp[0],0,Math.PI/2);
      for(const d of[0.1,0.3]){const p=sideP(sg,d,-HB-0.024);nut(trough,x,p[1],p[0],-sg*A);}
      /* side bracket with foot and gusset, hole row for 20 / 30 / 35 / 45° */
      const zb=sg*0.68;
      box(0.15,0.36,0.014,M.paint,base,x,-0.11,zb);
      extr(sg>0?[[0.68,-0.13],[0.68,0.04],[0.79,-0.13]]:[[-0.79,-0.13],[-0.68,0.04],[-0.68,-0.13]],0.012,M.paint,base,x);
      box(0.17,0.014,0.13,M.paint,base,x,-0.123,sg*0.745);
      for(const bx of[-0.055,0.055])nut(base,x+bx,-0.111,sg*0.76);
      for(const hy of[-0.08,-0.03,0.02,0.055])nut(base,x+0.04,hy,zb-sg*0.009,Math.PI/2);
      /* adjustable strut: from the arm to the bracket */
      const pa=sideP(sg,0.33,-HB-0.06),pb=[zb-sg*0.03,0.02];
      for(const fx of[-0.06,0.06])strut(base,x+fx,pa,pb,0.04,0.012,M.paint);
      nut(base,x+0.068,pb[1],pb[0],0,Math.PI/2);nut(base,x+0.068,pa[1],pa[0],0,Math.PI/2);
      /* bottom: transverse plate to the bracket */
      box(0.12,0.012,Math.abs(zb)-0.27,M.paint,base,x,-0.286,sg*(0.27+(Math.abs(zb)-0.27)/2));
    }
  }
  /* longitudinal box beams under the centre frames and tie rods between the brackets */
  for(const sg of[-1,1]){box(L-0.02,0.12,0.1,M.paint,base,0,-0.352,sg*0.16);
    const rod=new T.CylinderGeometry(0.012,0.012,L-0.04,12);rod.rotateZ(Math.PI/2);for(const ry of[-0.07,-0.01]){const m=K.mesh(rod,M.alu,base,0,ry,sg*0.66);}}
  K.flush();
  function setTravel(dy){trough.position.y=dy*0.35;}
  return{root,base,trough,bars,setTravel,L};
}
window.LegacyBeds={hcz,hck};
})();
