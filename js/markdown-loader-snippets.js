
// ---------------------
// source: https://chatgpt.com/c/68186823-f020-800c-b6ed-79d0dd558cd2
// ---------------------

<div class="ldr-btn"
     data-src="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md"
     onclick="
       if(this.dataset.open){
         this.innerHTML=this.dataset.old;
         this.classList.replace('ldr-con','ldr-btn');
         delete this.dataset.open;
       } else {
         this.dataset.old=this.innerHTML;
         fetch(this.dataset.src).then(r=>r.text()).then(t=>{
           this.innerHTML=markdown(t)+'<div class=\'ldr-btn\'>close</div>';
           this.classList.replace('ldr-btn','ldr-con');
           this.dataset.open=1;
           this.onclick=(e)=>e.stopPropagation();this.onclick();
         });
       }
     ">lpunpack</div>

// -----------------
     
<div class="ldr-btn" data-src="URL_HERE" onclick="
  this.className^='ldr' ? (
    fetch(this.dataset.src).then(r=>r.text()).then(t=>
      this.innerHTML=markdown(t)+`<div class='ldr-btn'>close</div>`
    ), this.className='ldr-con', this.onclick=()=>(
      this.className='ldr-btn', this.innerHTML='lpunpack', delete this.onclick
    )
  ) : 0
">lpunpack</div>


// -----------------


<div class="ldr-btn"
     data-src="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md"
     onclick="
       if(this.dataset.open){
         this.innerHTML=this.dataset.old;
         this.classList.replace('ldr-con','ldr-btn');
         delete this.dataset.open;
       } else {
         this.dataset.old=this.innerHTML;
         fetch(this.dataset.src).then(r=>r.text()).then(t=>{
           this.innerHTML=markdown(t)+`<span class='ldr-btn'>close</span>`; this.classList.replace('ldr-btn','ldr-con');
           this.dataset.open=1;
         });
       }
     ">lpunpack</div>

<div class="ldr-btn"
     data-src="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md"
     onclick="
       if(this.className==='ldr-con'){
         this.innerHTML=this.dataset.old;
         this.classList.replace('ldr-con','ldr-btn');
       } else {
         this.dataset.old=this.innerHTML;
         fetch(this.dataset.src).then(r=>r.text()).then(t=>{
           this.innerHTML=markdown(t)+`<span class='ldr-btn'>close</span>`;
           this.classList.replace('ldr-btn','ldr-con');
         });
       }
     ">lpunpack</div>
     
<div class="ldr-btn"
     data-src="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md"
     onclick="
       if(this.className==='ldr-con'){
         this.innerHTML=this.dataset.old;
this.classList.replace('ldr-con','ldr-btn');
       } else {
         this.dataset.old=this.innerHTML;
         fetch(this.dataset.src).then(r=>r.text()).then(t=>{
           this.innerHTML=markdown(t)+`<span class='ldr-btn'>close</span>`;
this.classList.replace('ldr-btn','ldr-con');
         });
       }
     ">lpunpack</div>

     
// ------------------------
// ------------------------


<div class="ldr-btn"
     data-src="..."
     onclick="
       if (event.target !== this) return;
       if (this.className === 'ldr-con') {
         this.innerHTML = this.dataset.old;
         this.classList.replace('ldr-con', 'ldr-btn');
       } else {
         this.dataset.old = this.innerHTML;
         fetch(this.dataset.src).then(r => r.text()).then(t => {
           this.innerHTML = markdown(t) + `<div class='ldr-btn'>close</div>`;
           this.classList.replace('ldr-btn', 'ldr-con');
         });
       }
     ">title</div>

     
// ------------------------
// well working code
// ------------------------

<div class="ldr-btn"
     data-src="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md"
     onclick="
       if (event.target !== this) return;
       if (this.className === 'ldr-con') {
         this.innerHTML = this.dataset.old;
         this.classList.replace('ldr-con', 'ldr-btn');
       } else {
         this.dataset.old = this.innerHTML;
         fetch(this.dataset.src).then(r => r.text()).then(t => {
           this.innerHTML = markdown(t) + `<div class='ldr-btn' onclick='this.parentNode.click()'>close</div>`;
           this.classList.replace('ldr-btn', 'ldr-con');
         });
       }
     ">lpunpack</div>

// -----------------------
//  x icon
// -----------------------

<div class="ldr-btn"
     data-src="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md"
     onclick="
       if (event.target !== this) return;
       if (this.className === 'ldr-con') {
         this.innerHTML = this.dataset.old;
         this.classList.replace('ldr-con', 'ldr-btn');
       } else {
         this.dataset.old = this.innerHTML;
         fetch(this.dataset.src).then(r => r.text()).then(t => {
           this.innerHTML =
             `<button id='x-but2' type='button' class='bared btn x-but' onclick='this.parentNode.click()' title='Close'></button>` +
             markdown(t);
           this.classList.replace('ldr-btn', 'ldr-con');
         });
       }
     ">lpunpack</div>

     
// ----------------------- 

<div class="ldr-btn"
    data-src="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md"
    onclick="(e => {
    if (e.target !== this) return;
    if (this.className === 'ldr-con') {
        this.innerHTML = this.dataset.old;
        this.classList.replace('ldr-con', 'ldr-btn');
    } else {
        this.dataset.old = this.innerHTML;
        fetch(this.dataset.src).then(r => r.text()).then(t => {
        this.innerHTML = markdown(t) + `<div class='ldr-btn' onclick='this.parentNode.onclick(new Event(&quot;click&quot;))'>close</div>`;
        this.classList.replace('ldr-btn', 'ldr-con');
        });
    }
    })(event)">lpunpack</div>

    
// ---

<div class="ldr-btn"
     data-src="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md"
     onclick="(el=>e=>{
       if(e.target!==el)return;
       if(el.className==='ldr-con'){
         el.innerHTML=el.dataset.old;
         el.classList.replace('ldr-con','ldr-btn');
       } else {
         el.dataset.old=el.innerHTML;
         fetch(el.dataset.src).then(r=>r.text()).then(t=>{
           el.innerHTML=markdown(t)+`<div class='ldr-btn' onclick='(e=>e.target.parentNode.onclick(e))(event)'>close</div>`;
           el.classList.replace('ldr-btn','ldr-con');
         });
       }
     })(this)(event)">lpunpack</div>

     
// -----------
// -----------
// -----------

function ldrToggle(el, event) {
  // Don't trigger toggle if [close] was clicked
  if (event.target.classList.contains('close')) {
    el.innerHTML = el.dataset.old;
    el.classList.replace('ldr-con', 'ldr-btn');
    return;
  }

  // Already opened?
  if (el.classList.contains('ldr-con')) return;

  el.dataset.old = el.innerHTML;
  fetch(el.dataset.src).then(r => r.text()).then(t => {
    el.innerHTML = markdown(t) + `<div class='close'>[close]</div>`;
    el.classList.replace('ldr-btn', 'ldr-con');
  });
}

// ---

function ldrToggle(el, event) {
  // Close if click came from the [close] button or edge
  if (event.target.classList.contains('close') || event.target.classList.contains('ldr-overlay')) {
    el.innerHTML = el.dataset.old;
    el.classList.replace('ldr-con', 'ldr-btn');
    return;
  }

  // Already open? Ignore clicks inside
  if (el.classList.contains('ldr-con')) return;

  // Load content and add [close] + overlay
  el.dataset.old = el.innerHTML;
  fetch(el.dataset.src).then(r => r.text()).then(t => {
    el.innerHTML = `
      <div class="ldr-inner">${markdown(t)}</div>
      <div class="close">[close]</div>
      <div class="ldr-overlay" title="Click edge to close"></div>
    `;
    el.classList.replace('ldr-btn', 'ldr-con');
  });
}



// --------------------


function toggleLoader(el, event) {
  if (event.target !== el) return;

  if (el.className === 'ldr-con') {
    el.innerHTML = el.dataset.old;
    el.className = 'ldr-btn';
  } else {
    el.dataset.old = el.innerHTML;
    fetch(el.dataset.src).then(function(r) { return r.text(); }).then(function(t) {
      el.innerHTML = markdown(t) +
        "<button id='x-but2' type='button' class='bared btn x-but' onclick='this.parentNode.click()' title='Close'></button>";
      el.className = 'ldr-con';
    });
  }
}


// ---
// ---


function ldrToggle(el, event) {
  // Don't trigger toggle if [close] was clicked
  if (event.target.classList.contains('close')) {
    el.innerHTML = el.dataset.old;
    el.classList.replace('ldr-con', 'ldr-btn');
    return;
  }

  // Already opened?
  if (el.classList.contains('ldr-con')) return;

  el.dataset.old = el.innerHTML;
  fetch(el.dataset.src).then(r => r.text()).then(t => {
    el.innerHTML = markdown(t) + `<div class='close'>[close]</div>`;
    el.classList.replace('ldr-btn', 'ldr-con');
  });
}


// -----------------
// 3-layer pie

// 1:content
// 2:overlay
// 3:content again (to click and select)
// -----------------

function toggleLoader(el, event) {
  // Only allow collapse on click to edge or close button
  if (
    el.className === 'ldr-con' &&
    !event.target.classList.contains('ldr-edge') &&
    event.target.id !== 'x-but2'
  ) return;
  
  if (el.className === 'ldr-con') {
      el.innerHTML = el.dataset.old;
      el.className = 'ldr-btn';
  } else {
      el.dataset.old = el.innerHTML;
      fetch(el.dataset.ldr).then(r => r.text()).then(t => {
        el.innerHTML = `
          <div class="ldr-edge"></div>
          ${markdown(t)}
          <button id="x-but2" type="button" class="bared btn x-but" title="Close"></button>`;
        el.className = 'ldr-con';
      });
  }
}

function waitForLoader(resizableDiv) {
   resizableDiv.querySelectorAll('[data-ldr]').forEach(el => {
      el.classList.add('ldr-btn');
      el.addEventListener('click', e => toggleLoader(el, e));
   });

}
