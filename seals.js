/* Legacy · уплотнения течки по документам производителей.
   pus / puc — внутренние секции 1219 × 178 × 25 мм: сталь 6 + ПУ 19, либо сталь 6 + ПУ 6 + керамика 13 (92 % Al₂O₃), 5 пазов.
   dual  — двухконтурный ПУ-профиль (тип Flexco Dual Seal): пластина 200 × 20 мм, фаска 35° по ленте,
           вторая «плавающая» губка за основной пластиной; клиновые прижимы на кронштейнах.
   rail  — ПУ-профиль с замковым буртом в монтажной рейке и опорной губкой на ленте.
   snap  — K-Snap-Loc (Kinder KDOC00079): юнистрат 41 × 41 приварен снаружи стенки на высоте X над лентой,
           буртик профиля защёлкнут в швеллер, полотно ложится на ленту полосой 40–80 мм, фиксирующий палец с пружинной скобой.
   block — K-Super Block (Kinder KDOC00063): опорная плита на стенке, сегменты 200 × 200 × 25 мм с фаской 35°,
           прижимные пластины на двух шпильках M16 с шагом 80 мм; rear — задняя стенка, сегменты подрезаны по желобу.
   Система координат стороны +z: x — вдоль ленты, z — поперёк (наружу), y — вверх. Сторону −z получают зеркалом scale.z = −1.
   o: L (длина), x0 (середина), zw (ось стенки), wt (толщина стенки), wallBot (низ стенки), beltY(z) — верх ленты. */
(function(){
'use strict';
const A=35*Math.PI/180;
function build(T,kind,o){
  const std=p=>{const m=new T.MeshStandardMaterial(p);m.color.convertSRGBToLinear();return m;};
  const MT=o.mat||{};
  const pu=MT.pu||std({color:0xb81a14,roughness:.55}),galv=MT.galv||std({color:0xa9b0b6,roughness:.38,metalness:.85}),
    steel=MT.steel||std({color:0x5b6670,roughness:.45,metalness:.6}),cer=MT.cer||std({color:0xefece4,roughness:.3}),
    dark=MT.dark||std({color:0x1c1e21,roughness:.6,metalness:.5}),bolt=MT.bolt||std({color:0xc5cbd0,roughness:.3,metalness:1});
  const L=o.L,x0=o.x0||0,zw=o.zw,wt=o.wt||0.012,zi=zw-wt/2,zo=zw+wt/2,by=o.beltY,root=new T.Group();
  function mesh(g,m,p,x,y,z){const q=new T.Mesh(g,m);q.castShadow=q.receiveShadow=true;if(x!==undefined)q.position.set(x,y,z);(p||root).add(q);return q;}
  function box(w,h,d,m,p,x,y,z){return mesh(new T.BoxGeometry(w,h,d),m,p,x,y,z);}
  function cyl(r,l,m,p,x,y,z,ax,seg){const g=new T.CylinderGeometry(r,r,l,seg||12);if(ax==='z')g.rotateX(Math.PI/2);if(ax==='x')g.rotateZ(Math.PI/2);return mesh(g,m,p,x,y,z);}
  /* closed (z,y) polygon extruded along x */
  function extr(pts,len,m,p,x){const s=new T.Shape();const q=pts.map(a=>[-a[0],a[1]]);s.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)s.lineTo(q[i][0],q[i][1]);s.closePath();
    const g=new T.ExtrudeGeometry(s,{depth:len,bevelEnabled:false,curveSegments:10});g.translate(0,0,-len/2);g.rotateY(Math.PI/2);g.computeVertexNormals();const r=mesh(g,m,p);r.position.x=x===undefined?x0:x;return r;}
  /* (x,y) polygon extruded along z (for parts facing along the belt, e.g. the rear wall) */
  function extrZ(pts,dep,m,p,z){const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();
    const g=new T.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false});g.translate(0,0,-dep/2);g.computeVertexNormals();const r=mesh(g,m,p);r.position.z=z||0;return r;}
  const HEX=new T.CylinderGeometry(0.012,0.012,0.012,6),pend=[];
  function nut(x,y,z,ax){pend.push([x,y,z,ax]);}
  function flush(){if(!pend.length)return;const im=new T.InstancedMesh(HEX,bolt,pend.length),d=new T.Object3D();im.castShadow=true;
    pend.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(q[3]==='z'?Math.PI/2:0,0,q[3]==='x'?Math.PI/2:0);d.updateMatrix();im.setMatrixAt(i,d.matrix);});root.add(im);}
  const sections=(len,step)=>{const r=[];let a=x0-len/2;while(a<x0+len/2-0.05){const l=Math.min(step,x0+len/2-a);r.push([a+l/2,l-0.006]);a+=step;}return r;};

  if(kind==='pus'||kind==='puc'){
    /* inner wear liner sections, hung on the inner face of the chute wall */
    const yb=by(zi-0.02)+0.012,H=0.178,yt=yb+H,tSt=0.006,tPu=kind==='puc'?0.006:0.019;
    const zS=zi-tSt/2,zP=zi-tSt-tPu/2;
    const tiles=[];
    for(const[xc,ls]of sections(L,1.219)){
      box(ls,H,tSt,steel,null,xc,yb+H/2,zS);
      /* polyurethane body with a 45° chamfer at the bottom flow edge */
      const zf=zi-tSt-tPu;extr([[zi-tSt,yb],[zf+0.006,yb],[zf,yb+0.006],[zf,yt],[zi-tSt,yt]],ls,pu,null,xc);
      /* 5 slots per full section: carriage bolt in each, nut on the outside of the wall */
      const ns=Math.max(1,Math.round(5*ls/1.219));
      for(let k=0;k<ns;k++){const xs=xc-ls/2+ls*(k+0.5)/ns;
        box(0.024,0.062,0.004,dark,null,xs,yt-0.058,zi-tSt-(kind==='puc'?0.019:tPu)-0.001);
        cyl(0.011,0.008,bolt,null,xs,yt-0.045,zi-tSt-(kind==='puc'?0.019:tPu)-0.004,'z',14);
        nut(xs,yt-0.045,zo+0.006,'z');
        if(kind==='puc')tiles.push([xs,'slot']);}
      if(kind==='puc'){const pz=zf-0.0065;
        for(let x=xc-ls/2+0.022;x<xc+ls/2-0.015;x+=0.034)for(let y=yb+0.02;y<yt-0.012;y+=0.034){
          if(y>yt-0.1&&tiles.some(s=>s[1]==='slot'&&Math.abs(s[0]-x)<0.03))continue;tiles.push([x,y,pz]);}}
    }
    if(kind==='puc'){const tl=tiles.filter(t=>t[1]!=='slot');const im=new T.InstancedMesh(new T.BoxGeometry(0.03,0.03,0.013),cer,tl.length),d=new T.Object3D();im.castShadow=true;
      tl.forEach((t,i)=>{d.position.set(t[0],t[1],t[2]);d.updateMatrix();im.setMatrixAt(i,d.matrix);});root.add(im);
      /* PU rim around the tiles and the slot windows */
      for(const[xc,ls]of sections(L,1.219)){box(ls,0.012,0.013,pu,null,xc,yb+0.006,zi-tSt-tPu-0.0065);box(ls,0.008,0.013,pu,null,xc,yt-0.004,zi-tSt-tPu-0.0065);}}
  }

  else if(kind==='dual'){
    /* main slab 200 × 20 with the 35° bottom chamfer lying on the belt, secondary floating lip behind it */
    const t=0.02,H=0.2,z1=zo+0.004,z2=z1+t,yb1=by(z1)+0.002,yb2=by(z2)+0.002,yt=yb1+H;
    const zl=z2+0.085,lipT=0.007,gap=0.004,N=8;
    /* rebuild as a clean outline: slab bottom, flap underside, bead, flap top, slab outer face, top, inner face */
    const Q=[[z1,yb1],[z1+0.006,by(z1+0.006)+0.002]];
    for(let i=0;i<=N;i++){const z=z2+(zl-z2)*i/N;Q.push([z,by(z)+gap]);}
    for(let i=0;i<=10;i++){const a=-Math.PI/2+Math.PI*i/10;Q.push([zl+0.01*Math.cos(a)+0.002,by(zl)+gap+0.01+0.01*Math.sin(a)]);}
    for(let i=N;i>=0;i--){const z=z2+(zl-z2)*i/N;Q.push([z,by(z)+gap+lipT+(i===0?0.01:0)]);}
    Q.push([z2,yt],[z1,yt]);
    extr(Q,L,pu);
    /* wedge clamps: welded bracket, clamp angle along the slab, wedge through the bracket */
    const yc=yt-0.07;
    box(L,0.05,0.006,galv,null,x0,yc,z2+0.003);box(L,0.006,0.04,galv,null,x0,yc+0.022,z2+0.023);
    for(let x=x0-L/2+0.2;x<x0+L/2-0.1;x+=0.45){
      box(0.012,0.12,0.075,galv,null,x-0.035,yc+0.01,zo+0.0375);box(0.012,0.12,0.075,galv,null,x+0.035,yc+0.01,zo+0.0375);
      box(0.082,0.012,0.075,galv,null,x,yc+0.064,zo+0.0375);
      const w=extr([[z2+0.008,yc-0.03],[z2+0.03,yc-0.03],[z2+0.042,yc+0.055],[z2+0.008,yc+0.055]],0.06,steel,null,x);
      nut(x,yc+0.074,zo+0.04);}
  }

  else if(kind==='rail'){
    /* mounting rail: galvanised C-channel welded to the wall, profile key held in it; slab with a supporting foot on the belt */
    const yr=by(zo+0.02)+0.21,t=0.016,z1=zo+0.012,z2=z1+t;
    extr([[zo,yr-0.035],[zo+0.042,yr-0.035],[zo+0.042,yr-0.027],[zo+0.008,yr-0.027],[zo+0.008,yr+0.027],[zo+0.042,yr+0.027],[zo+0.042,yr+0.035],[zo,yr+0.035]],L,galv);
    const ft=0.07,yb=by(z1)+0.002,Q=[[z1,yr+0.022],[z1,yb+0.006],[z1+0.004,yb]];
    for(let i=0;i<=6;i++){const z=z2+ft*i/6;Q.push([z,by(z)+0.002]);}
    for(let i=0;i<=8;i++){const a=-Math.PI/2+Math.PI*i/8;Q.push([z2+ft+0.012*Math.cos(a),by(z2+ft)+0.014+0.012*Math.sin(a)]);}
    for(let i=6;i>=0;i--){const z=z2+ft*i/6;Q.push([z,by(z)+0.014+0.01*(1-i/6)]);}
    Q.push([z2,yr-0.024],[z2+0.014,yr-0.024],[z2+0.014,yr+0.022]);
    extr(Q,L,pu);
    for(let x=x0-L/2+0.15;x<x0+L/2;x+=0.3){nut(x,yr,zo+0.043,'z');}
  }

  else if(kind==='snap'){
    /* Kinder table: size Z = 230 mm on a 35° trough → X = 159 mm from the belt to the bottom of the channel */
    const X=0.159,yc0=by(zo+0.02)+X,h=0.041,yc=yc0+h/2,zc=zo,tc=0.0025;
    /* unistrut 41 × 41 × 2.5, open side outward, lips turned in */
    extr([[zc,yc0],[zc+h,yc0],[zc+h,yc0+0.009],[zc+h-tc,yc0+0.009],[zc+h-tc,yc0+tc],[zc+tc,yc0+tc],[zc+tc,yc0+h-tc],[zc+h-tc,yc0+h-tc],[zc+h-tc,yc0+h-0.009],[zc+h,yc0+h-0.009],[zc+h,yc0+h],[zc,yc0+h]],L,galv);
    /* 50 mm stitch welds every 400 mm, top and bottom */
    for(let x=x0-L/2+0.2;x<x0+L/2;x+=0.4){box(0.05,0.006,0.006,dark,null,x,yc0+h+0.002,zo+0.003);box(0.05,0.006,0.006,dark,null,x,yc0-0.002,zo+0.003);}
    /* bulb (trapezoid) inside the channel + seal web leaving through the slot, curving down onto the belt */
    const Bz=zc+0.006,Q=[[Bz,yc-0.012],[zc+0.03,yc-0.006],[zc+h+0.004,yc-0.004]];
    const pts=[],N=22,ze=zo+0.13,zk=zo+0.07;
    for(let i=0;i<=N;i++){const t=i/N,u=1-t;
      const z=u*u*u*(zc+h+0.004)+3*u*u*t*(zc+h+0.03)+3*u*t*t*(zk-0.01)+t*t*t*zk;
      const y=u*u*u*(yc-0.004)+3*u*u*t*(yc-0.05)+3*u*t*t*(by(zk)+0.03)+t*t*t*(by(zk)+0.002);pts.push([z,y]);}
    const flat=[];for(let i=1;i<=6;i++){const z=zk+(ze-zk)*i/6;flat.push([z,by(z)+0.002]);}
    const outer=pts.concat(flat),th=0.008;
    Q.push(...outer.slice(1));
    Q.push([ze+0.004,by(ze)+0.006]);
    const inner=outer.map((p,i)=>{const a=outer[Math.max(0,i-1)],b=outer[Math.min(outer.length-1,i+1)];const dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy)||1;return[p[0]-dy/l*th*(i>pts.length?-1:-1)*-1,p[1]+dz/l*th];});
    for(let i=inner.length-1;i>=1;i--)Q.push(inner[i]);
    Q.push([zc+h+0.004,yc+0.004],[zc+0.03,yc+0.006],[Bz,yc+0.012]);
    extr(Q,L,pu);
    /* retaining pins at the tail and head ends: pin through both flanges and the bulb, spring catch loop */
    for(const x of[x0-L/2+0.03,x0+L/2-0.03]){
      cyl(0.0055,h+0.05,bolt,null,x,yc,zc+0.016,null,10);
      cyl(0.011,0.006,bolt,null,x,yc0+h+0.004,zc+0.016,null,14);
      const loop=mesh(new T.TorusGeometry(0.03,0.003,6,20,Math.PI*1.4),bolt,null,x,yc+0.004,zc+0.04);loop.rotation.set(0,Math.PI/2,-Math.PI*0.7);}
  }

  else if(kind==='block'){
    /* backing plate on the outer face of the wall, 200 × 200 × 25 segments with a 35° bevel resting on the belt */
    const tb=0.01,zb=zo+tb,ts=0.025,zs=zb+ts,yT=o.wallBot+0.16;
    box(L,0.2,tb,steel,null,x0,yT-0.1,zo+tb/2);
    for(const[xc,ls]of sections(L,0.2)){
      const g=0.002,ya=by(zb)+g,yb2=by(zs)+g;
      extr([[zb,ya],[zs,yb2],[zs,yT],[zb,yT]],ls,pu,null,xc);
      box(0.11,0.13,0.008,galv,null,xc,yT-0.08,zs+0.004);
      for(const dy of[-0.04,0.04]){nut(xc,yT-0.08+dy,zs+0.014,'z');cyl(0.015,0.003,galv,null,xc,yT-0.08+dy,zs+0.0095,'z',16);}
    }
  }

  else if(kind==='rear'){
    /* rear wall (plane x = o.xr, outside towards −x): segments across the trough, bottoms trimmed to the belt profile */
    const xr=o.xr,zh=o.zh,yT=o.wallBot+0.16,tb=0.01,ts=0.025;
    box(tb,0.2,2*zh,steel,null,xr-tb/2,yT-0.1,0);
    const n=Math.round(2*zh/0.2),w=2*zh/n;
    for(let k=0;k<n;k++){const za=-zh+k*w+0.003,zb=za+w-0.006,P=[];
      for(let i=0;i<=8;i++){const z=za+(zb-za)*i/8;P.push([z,by(Math.abs(z))+0.003]);}P.push([zb,yT],[za,yT]);
      const s=new T.Shape();s.moveTo(P[0][0],P[0][1]);P.slice(1).forEach(p=>s.lineTo(p[0],p[1]));s.closePath();
      const g=new T.ExtrudeGeometry(s,{depth:ts,bevelEnabled:false});g.rotateY(-Math.PI/2);g.translate(xr-tb,0,0);g.computeVertexNormals();mesh(g,pu);
      const zc=(za+zb)/2;box(0.008,0.13,0.11,galv,null,xr-tb-ts-0.004,yT-0.08,zc);
      for(const dy of[-0.04,0.04])nut(xr-tb-ts-0.014,yT-0.08+dy,zc,'x');}
  }
  flush();
  return root;
}
window.LegacySeals={build};
})();
