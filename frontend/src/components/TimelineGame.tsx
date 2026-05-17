import React, { useEffect } from 'react';

export default function TimelineGame(){
  useEffect(()=>{
    const ITEMS = [
      {id:1, name:"Rueda", year:"3300 a.C.", order:1, img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Wooden_wheel.jpg/320px-Wooden_wheel.jpg"},
      {id:2, name:"Pirámides", year:"2560 a.C.", order:2, img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/320px-Kheops-Pyramid.jpg"},
      {id:3, name:"Brújula", year:"200 a.C.", order:3, img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Simple_Compass.jpg/320px-Simple_Compass.jpg"},
      {id:4, name:"Imprenta", year:"1440", order:4, img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Buchdruck_im_15._Jahrhundert.jpg/320px-Buchdruck_im_15._Jahrhundert.jpg"},
      {id:5, name:"Telescopio", year:"1608", order:5, img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Galileo_Galilei%27s_Telescope.jpg/320px-Galileo_Galilei%27s_Telescope.jpg"},
      {id:6, name:"Teléfono", year:"1876", order:6, img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Candlestick_telephone.jpg/320px-Candlestick_telephone.jpg"},
      {id:7, name:"Televisión", year:"1926", order:7, img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Televison_screen_close_up.jpg/320px-Televison_screen_close_up.jpg"},
      {id:8, name:"Smartphone", year:"2007", order:8, img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Smartphone_hand.jpg/320px-Smartphone_hand.jpg"},
    ];

    let pool: number[] = [];
    let slots: (number|null)[] = new Array(8).fill(null);
    let draggingId: number|null = null;
    let draggingFrom: any = null;

    function shuffle(arr:any[]){
      const a=[...arr];
      for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
      return a;
    }

    function cardHTML(item:any){
      return `<div class="card" id="card-${item.id}" draggable="true"
        ondragstart="window.__onDragStart && window.__onDragStart(event,${item.id})"
        ondragend="window.__onDragEnd && window.__onDragEnd(event)">
        <img src="${item.img}" alt="${item.name}" onerror="this.style.background='#ddd';this.style.height='70px'">
        <div class="card-foot">
          <div class="card-name">${item.name}</div>
          <div class="card-year">${item.year}</div>
        </div>
      </div>`;
    }

    function renderPool(){
      const el=document.getElementById("pool");
      if(!el) return;
      el.innerHTML = pool.length===0
        ? '<span style="color:var(--color-on-surface-variant);font-size:13px;align-self:center">Todas las tarjetas están en la línea</span>'
        : pool.map(id=>cardHTML(ITEMS.find(i=>i.id===id))).join("");
      el.ondragover=(e:any)=>{e.preventDefault();el.classList.add("drag-over");};
      el.ondragleave=()=>el.classList.remove("drag-over");
      el.ondrop=(e:any)=>{e.preventDefault();el.classList.remove("drag-over");dropToPool();};
    }

    function renderSlots(){
      const el=document.getElementById("tl-slots");
      if(!el) return;
      el.innerHTML="";
      slots.forEach((itemId,i)=>{
        const slot=document.createElement("div");
        slot.className="slot"+(itemId?" has-card":"");
        slot.dataset.index=String(i);
        if(itemId){
          const item=ITEMS.find((x:any)=>x.id===itemId);
          slot.innerHTML=cardHTML(item);
        } else {
          slot.innerHTML=`<span style="font-size:28px;color:var(--color-on-surface-variant)">${i+1}</span>`;
        }
        slot.ondragover=(e:any)=>{e.preventDefault();slot.classList.add("drag-over")};
        slot.ondragleave=()=>slot.classList.remove("drag-over");
        slot.ondrop=(e:any)=>{e.preventDefault();slot.classList.remove("drag-over");dropToSlot(i)};
        el.appendChild(slot);
      });
    }

    (window as any).__onDragStart = function(_e:any,id:number){
      draggingId=id;
      const fromSlot=slots.indexOf(id);
      draggingFrom=fromSlot>=0?{type:"slot",index:fromSlot}:{type:"pool"};
      setTimeout(()=>{const el=document.getElementById("card-"+id); if(el) el.classList.add("dragging");},0);
    };
    (window as any).__onDragEnd = function(){
      document.querySelectorAll(".card").forEach(c=>c.classList.remove("dragging"));
    };

    function dropToSlot(i:number){
      if(draggingId===null) return;
      const existing=slots[i];
      if(draggingFrom.type==="pool"){
        pool = pool.filter(x=>x!==draggingId);
        if(existing!==null) pool.push(existing as number);
      } else {
        if(existing!==null) slots[draggingFrom.index]=existing;
        else slots[draggingFrom.index]=null;
      }
      slots[i]=draggingId;
      draggingId=null; draggingFrom=null;
      const rb=document.getElementById("result-bar"); if(rb) rb.classList.remove("show");
      renderPool(); renderSlots();
    }

    function dropToPool(){
      if(draggingId===null) return;
      if(draggingFrom.type==="slot") slots[draggingFrom.index]=null;
      if(!pool.includes(draggingId)) pool.push(draggingId);
      draggingId=null; draggingFrom=null;
      const rb=document.getElementById("result-bar"); if(rb) rb.classList.remove("show");
      renderPool(); renderSlots();
    }

    function checkOrder(){
      const placed = slots.filter(Boolean);
      const bar=document.getElementById("result-bar");
      if(!bar) return;
      if(placed.length<8){
        bar.className="result-bar show partial";
        bar.textContent = "Faltan tarjetas por colocar. ¡Pon las "+(8-placed.length)+" que quedan!";
        return;
      }
      let correct=0;
      const slotEls = document.querySelectorAll(".slot");
      slotEls.forEach((el:any,i)=>{
        el.querySelectorAll(".tick").forEach((t:any)=>t.remove());
        const item = ITEMS.find(x=>x.id===slots[i]);
        const tick = document.createElement("div");
        tick.className="tick";
        if(item && item.order===i+1){correct++; tick.classList.add("ok"); tick.textContent="✓";} else {tick.classList.add("bad"); tick.textContent="✗"}
        el.appendChild(tick);
      });
      if(correct===8){bar.className="result-bar show win"; bar.textContent = "🎉 ¡Perfecto! Ordenaste todos los artefactos correctamente. ¡Eres un genio de la historia!"}
      else if(correct>=5){bar.className="result-bar show partial"; bar.textContent = "🌟 ¡Casi! Tienes "+correct+" de 8 en el lugar correcto. ¡Inténtalo de nuevo!"}
      else {bar.className="result-bar show lose"; bar.textContent = "😅 Solo "+correct+" correctos. ¡No te rindas, vuelve a intentarlo!"}
    }

    function resetGame(){
      pool = shuffle(ITEMS).map(i=>i.id);
      slots = new Array(8).fill(null);
      const bar=document.getElementById("result-bar"); if(bar) bar.classList.remove("show");
      document.querySelectorAll(".tick").forEach(t=>t.remove());
      renderPool(); renderSlots();
    }

    (window as any).__checkOrder = checkOrder;
    (window as any).__resetGame = resetGame;

    setTimeout(()=>resetGame(), 50);

    return ()=>{
      delete (window as any).__onDragStart;
      delete (window as any).__onDragEnd;
      delete (window as any).__checkOrder;
      delete (window as any).__resetGame;
    };
  },[]);

  return (
    <div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}
.page{padding:1.2rem 1rem 2rem;background:var(--color-surface);color:var(--color-on-surface)}
.hero{text-align:center;margin-bottom:1.2rem}
.hero h1{font-size:21px;font-weight:500}
.hero p{font-size:13px;color:var(--color-on-surface-variant);margin-top:3px}
.section-label{font-size:11px;font-weight:500;letter-spacing:.06em;color:var(--color-on-surface-variant);text-transform:uppercase;margin-bottom:.6rem}
.pool{display:flex;flex-wrap:wrap;gap:10px;min-height:120px;padding:12px;border:2px dashed var(--color-outline-variant);border-radius:12px;background:var(--color-surface-container-low);margin-bottom:1.4rem;transition:border-color .2s}
.pool.drag-over{border-color:var(--color-primary)}
.card{width:120px;min-height:152px;cursor:grab;border-radius:10px;border:1px solid var(--color-outline-variant);background:var(--color-surface-container);overflow:hidden;transition:transform .15s,box-shadow .15s;user-select:none}
.card:hover{transform:scale(1.04);box-shadow:0 12px 24px rgba(0,0,0,.06)}
.card.dragging{opacity:.4;transform:scale(.97)}
.card img{width:100%;height:76px;object-fit:cover;display:block;background:var(--color-surface)}
.card-foot{padding:8px 8px}
.card-name{font-size:12px;font-weight:500;color:var(--color-on-surface);line-height:1.3}
.card-year{font-size:11px;color:var(--color-on-surface-variant);margin-top:4px}
.tl-wrap{position:relative}
.tl-axis{display:flex;align-items:center;margin-bottom:.5rem;gap:0}
.tl-arrow{height:4px;flex:1;background:var(--color-outline-variant);border-radius:2px;position:relative}
.tl-arrow::after{content:'';position:absolute;right:-6px;top:-4px;border:6px solid transparent;border-left:10px solid var(--color-outline-variant)}
.tl-labels{display:flex;justify-content:space-between;font-size:11px;color:var(--color-on-surface-variant);margin-bottom:.7rem;padding:0 2px}
.tl-slots{display:flex;gap:8px;flex-wrap:wrap;min-height:130px;padding:10px;border:2px dashed var(--color-outline-variant);border-radius:12px;background:var(--color-surface-container-low);transition:border-color .2s}
.tl-slots.drag-over{border-color:var(--color-secondary)}
.slot{width:120px;min-height:152px;border:1.5px dashed var(--color-outline-variant);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--color-on-surface-variant);position:relative;transition:border-color .2s,background .2s}
.slot.has-card{border-style:solid;border-color:var(--color-outline)}
.slot.drag-over{border-color:var(--color-secondary);background:rgba(122,215,198,.08)}
.check-row{display:flex;gap:10px;margin-top:1rem;align-items:center;flex-wrap:wrap}
.check-btn{padding:9px 20px;border:0.5px solid var(--color-outline-variant);border-radius:8px;background:transparent;color:var(--color-on-surface);font-size:14px;cursor:pointer}
.reset-btn{padding:9px 16px;border:0.5px solid var(--color-outline-variant);border-radius:8px;background:transparent;color:var(--color-on-surface-variant);font-size:13px;cursor:pointer}
.result-bar{margin-top:.9rem;padding:10px 14px;border-radius:8px;font-size:14px;font-weight:500;display:none}
.result-bar.show{display:block}
.result-bar.win{background:var(--color-surface);color:var(--color-secondary)}
.result-bar.partial{background:var(--color-surface-container-high);color:var(--color-warning)}
.result-bar.lose{background:var(--color-error-container);color:var(--color-error)}
.tick{position:absolute;top:4px;right:4px;width:18px;height:18px;border-radius:50%;font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:500}
.tick.ok{background:var(--color-secondary-container);color:var(--color-secondary)}
.tick.bad{background:var(--color-error-container);color:var(--color-error)}
`}</style>

      <div className="page">
        <div className="hero">
          <h1>⏳ Ordena la historia</h1>
          <p>Arrastra cada tarjeta a la línea del tiempo — del más antiguo al más reciente</p>
        </div>

        <p className="section-label">Tarjetas para ordenar</p>
        <div className="pool" id="pool"></div>

        <p className="section-label">Mi línea del tiempo</p>
        <div className="tl-wrap">
          <div className="tl-axis"><div className="tl-arrow"></div></div>
          <div className="tl-labels"><span>Más antiguo</span><span>Más reciente</span></div>
          <div className="tl-slots" id="tl-slots"></div>
        </div>

        <div className="check-row">
          <button className="check-btn" onClick={()=>{(window as any).__checkOrder && (window as any).__checkOrder()}}>Verificar orden</button>
          <button className="reset-btn" onClick={()=>{(window as any).__resetGame && (window as any).__resetGame()}}>Reiniciar</button>
        </div>

        <div className="result-bar" id="result-bar"></div>
      </div>
    </div>
  );
}
