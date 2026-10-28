/* Legacy Kazakhstan · shared realism pass for the 3D pages.
   Loads the procedural PBR textures from img/tex/ and upgrades the flat materials:
   painted steel and plates get world-space (triplanar) projection so long beams do not stretch the texture,
   belts, pulley lagging, rollers, concrete and ore get colour + roughness + normal maps. */
(function(){
  'use strict';
  var BASE='img/tex/';
  var cache={};
  function tex(T,name,srgb,rep){
    var key=name+(rep?rep.join('x'):'');
    if(cache[key])return cache[key];
    var t=new T.TextureLoader().load(BASE+name);
    t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;
    if(srgb)t.encoding=T.sRGBEncoding;
    if(rep)t.repeat.set(rep[0],rep[1]);
    cache[key]=t;return t;
  }
  /* world-space projection for map + roughnessMap, plus a little grime near the floor */
  function triplanar(mat,scale,grime){
    mat.onBeforeCompile=function(sh){
      sh.uniforms.tpScale={value:scale};
      sh.vertexShader=sh.vertexShader
        .replace('#include <common>','#include <common>\nvarying vec3 vTpPos;\nvarying vec3 vTpNrm;')
        .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvec4 tpW=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\ntpW=instanceMatrix*tpW;\n#endif\ntpW=modelMatrix*tpW;vTpPos=tpW.xyz;vTpNrm=normalize(mat3(modelMatrix)*objectNormal);');
      sh.fragmentShader=sh.fragmentShader
        .replace('#include <common>','#include <common>\nvarying vec3 vTpPos;\nvarying vec3 vTpNrm;\nuniform float tpScale;\nvec4 tpSample(sampler2D t){vec3 b=pow(abs(vTpNrm),vec3(4.0));b/=(b.x+b.y+b.z+1e-5);vec3 p=vTpPos*tpScale;return texture2D(t,p.zy)*b.x+texture2D(t,p.xz+0.37)*b.y+texture2D(t,p.xy+0.71)*b.z;}')
        .replace('#include <map_fragment>','#ifdef USE_MAP\nvec4 texelColor=mapTexelToLinear(tpSample(map));\ndiffuseColor*=texelColor;\n#endif\n'+(grime?'diffuseColor.rgb*=1.0-0.32*smoothstep(0.45,0.0,vTpPos.y);':''))
        .replace('#include <roughnessmap_fragment>','float roughnessFactor=roughness;\n#ifdef USE_ROUGHNESSMAP\nroughnessFactor*=tpSample(roughnessMap).g;\n#endif');
    };
    mat.customProgramCacheKey=function(){return 'tp'+scale+(grime?'g':'');};
    mat.needsUpdate=true;
  }
  function paint(T,m,scale){if(!m)return;m.map=tex(T,'paint_c.jpg',true);m.roughnessMap=tex(T,'paint_r.jpg');m.roughness=1;triplanar(m,scale||0.8,true);}
  function galv(T,m){if(!m)return;m.map=tex(T,'galv_c.jpg',true);m.roughnessMap=tex(T,'galv_r.jpg');m.roughness=1;triplanar(m,1.6,false);}
  function shell(T,m){if(!m)return;m.map=tex(T,'shell_c.jpg',true,[1,2]);m.roughnessMap=tex(T,'shell_r.jpg',false,[1,2]);m.roughness=1;m.needsUpdate=true;}
  /* redraw a CanvasTexture in place so existing offset animation keeps working */
  function intoCanvas(T,canvasTex,file,others){
    if(!canvasTex||!canvasTex.image||!canvasTex.image.getContext)return;
    var img=new Image();
    img.onload=function(){var c=canvasTex.image;c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);
      canvasTex.needsUpdate=true;(others||[]).forEach(function(t){if(t)t.needsUpdate=true;});};
    img.src=BASE+file;
  }
  function lagging(T,kind,rep){
    rep=rep||[2,1];
    var k={diamond:'lag_diamond',cer:'lag_cer',worn:'lag_worn',quick:'lag_diamond'}[kind]||'lag_diamond';
    return {map:tex(T,k+'_c.jpg',true,rep),normalMap:tex(T,k+'_n.jpg',false,rep),roughnessMap:tex(T,k+'_r.jpg',false,rep)};
  }
  function setLag(T,m,kind,rep,ns){var L=lagging(T,kind,rep);m.map=L.map;m.normalMap=L.normalMap;m.roughnessMap=L.roughnessMap;m.roughness=1;m.metalness=kind==='worn'?0.15:0;m.normalScale=new T.Vector2(ns||1.4,ns||1.4);m.color&&m.color.set(0xffffff);m.needsUpdate=true;}
  function belt(T,m,canvasTex,others){
    if(!m)return;intoCanvas(T,canvasTex,'belt_c.jpg',others);
    m.normalMap=tex(T,'belt_n.jpg');m.normalScale=new T.Vector2(0.7,0.7);m.roughnessMap=tex(T,'belt_r.jpg');m.roughness=1;m.needsUpdate=true;
  }
  function concrete(T,m,rep){if(!m)return;rep=rep||[10,7];m.map=tex(T,'concrete_c.jpg',true,rep);m.normalMap=tex(T,'concrete_n.jpg',false,rep);m.normalScale=new T.Vector2(0.6,0.6);m.roughnessMap=tex(T,'concrete_r.jpg',false,rep);m.roughness=1;m.color&&m.color.set(0xffffff);m.needsUpdate=true;}
  function rock(T,m){if(!m)return;m.map=tex(T,'rock_c.jpg',true);m.normalMap=tex(T,'rock_n.jpg');m.normalScale=new T.Vector2(1.2,1.2);m.needsUpdate=true;}
  function pu(T,m){if(!m)return;m.map=tex(T,'pu_c.jpg',true);m.normalMap=tex(T,'pu_n.jpg');m.normalScale=new T.Vector2(0.5,0.5);m.needsUpdate=true;}
  function rubber(T,m){if(!m)return;m.map=tex(T,'rubber_c.jpg',true,[3,3]);m.needsUpdate=true;}

  window.LegacyRealism={
    tex:tex,setLag:setLag,
    /* pages built on the shared kit (MAT/TX) */
    applyKit:function(T,o){
      var M=o.MAT;
      ['paint','amber','red','hyd'].forEach(function(k){paint(T,M[k]);});
      paint(T,M.plate,0.6);
      galv(T,M.galv);shell(T,M.shell);shell(T,M.cap);
      concrete(T,M.concrete);
      belt(T,M.belt,o.TX&&o.TX.belt,[o.retBeltTex]);
      if(M.retBelt){M.retBelt.normalMap=tex(T,'belt_n.jpg');M.retBelt.normalScale=new T.Vector2(0.7,0.7);M.retBelt.roughnessMap=tex(T,'belt_r.jpg');M.retBelt.roughness=1;M.retBelt.needsUpdate=true;}
      if(M.lag)setLag(T,M.lag,'diamond',[2,1],1.2);
      rock(T,M.ore);pu(T,M.pu);pu(T,M.puSoft);rubber(T,M.rubber);
    },
    /* the older «Зона загрузки» page with its own material set */
    applyZona:function(T,o){
      var M=o.M;
      paint(T,M.frame);galv(T,M.steel);shell(T,M.roller);galv(T,M.rail);
      concrete(T,M.ground,[14,10]);
      belt(T,M.belt,o.beltTex,[o.retTex]);
      if(M.retBelt){M.retBelt.normalMap=tex(T,'belt_n.jpg');M.retBelt.normalScale=new T.Vector2(0.7,0.7);M.retBelt.needsUpdate=true;}
      rock(T,M.rock);rock(T,M.fine);pu(T,M.pu);pu(T,M.puSoft);rubber(T,M.rubber);
      if(M.uhmw){M.uhmw.map=tex(T,'pu_c.jpg',true);M.uhmw.needsUpdate=true;}
      if(o.renderer&&o.scene&&!o.scene.environment){
        var pm=new T.PMREMGenerator(o.renderer),s=new T.Scene();
        var room=new T.Mesh(new T.BoxGeometry(30,14,30),new T.MeshBasicMaterial({color:0x272c33,side:T.BackSide}));room.position.y=6;s.add(room);
        for(var i=-2;i<=2;i++){var l=new T.Mesh(new T.PlaneGeometry(1.4,12),new T.MeshBasicMaterial({color:new T.Color(0xffffff).multiplyScalar(4),side:T.DoubleSide}));l.position.set(i*5,12.9,0);l.rotation.x=Math.PI/2;s.add(l);}
        o.scene.environment=pm.fromScene(s,0.04).texture;pm.dispose();
      }
    }
  };
})();
