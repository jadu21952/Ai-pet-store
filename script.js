const galleryData = {
  boy: ["boy-1.jpg", "boy-2.jpg", "boy-3.jpg", "boy-4.jpg", "boy-5.jpg", "boy-6.jpg"],
  girl: ["girl-1.jpg", "girl-2.jpg", "girl-3.jpg", "girl-4.jpg", "girl-5.jpg", "girl-6.jpg"]
};

const boxData = {
  boy: {
    device: "boy-box-device.jpg",
    cable: "boy-box-cable.jpg",
    guide: "boy-box-guide.jpg",
    card: "boy-box-card.jpg"
  },
  girl: {
    device: "girl-box-device.jpg",
    cable: "girl-box-cable.jpg",
    guide: "girl-box-guide.jpg",
    card: "girl-box-card.jpg"
  }
};

function updateBoxImages(edition) {
  const title = document.getElementById("boxEditionTitle");
  const device = document.getElementById("boxDeviceImage");
  const cable = document.getElementById("boxCableImage");
  const guide = document.getElementById("boxGuideImage");
  const card = document.getElementById("boxCardImage");

  if (title) title.textContent = edition === "boy" ? "Boy Edition" : "Girl Edition";
  if (device) device.src = boxData[edition].device;
  if (cable) cable.src = boxData[edition].cable;
  if (guide) guide.src = boxData[edition].guide;
  if (card) card.src = boxData[edition].card;
}

function setEdition(edition) {
  const main = document.getElementById('mainProductImage');
  const thumbs = document.getElementById('thumbColumn');
  const heroBuyBtn = document.getElementById('heroBuyBtn');
  const ctaBuyBtn = document.getElementById('ctaBuyBtn');
  const ctaImage = document.getElementById('ctaImage');
  const switchBtns = document.querySelectorAll('.switch-btn');
  const cards = document.querySelectorAll('.edition-card');
  if (heroBuyBtn) heroBuyBtn.href = `checkout.html?edition=${edition}`;
  if (ctaBuyBtn) ctaBuyBtn.href = `checkout.html?edition=${edition}`;
  if (ctaImage) ctaImage.src = galleryData[edition][3];
  switchBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.edition===edition));
  cards.forEach(card => card.classList.toggle('active', card.dataset.edition===edition));
  const links = document.querySelectorAll('.edition-link');
  links.forEach(link=>{ if(link.closest('[data-edition]')) link.href = `checkout.html?edition=${link.closest('[data-edition]').dataset.edition}`;});
  if (thumbs && main) {
    thumbs.innerHTML = '';
    galleryData[edition].forEach((img, idx) => {
      const btn = document.createElement('button');
      btn.className = 'thumb-btn' + (idx===0 ? ' active' : '');
      btn.type = 'button';
      btn.innerHTML = `<img src="${img}" alt="${edition} image ${idx+1}">`;
      btn.addEventListener('click', () => {
        main.src = img;
        document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      thumbs.appendChild(btn);
    });
    main.src = galleryData[edition][0];
  }
  updateBoxImages(edition);
}

function setupLanding(){
  const switchBtns = document.querySelectorAll('.switch-btn');
  const cards = document.querySelectorAll('.edition-card');
  switchBtns.forEach(btn => btn.addEventListener('click', ()=> setEdition(btn.dataset.edition)));
  cards.forEach(card => card.addEventListener('click', (e) => {
    if(e.target.tagName.toLowerCase()==='a') return;
    setEdition(card.dataset.edition);
    document.getElementById('gallery')?.scrollIntoView({behavior:'smooth', block:'start'});
  }));
  setEdition('boy');
}

function setupCheckout(){
  const params = new URLSearchParams(window.location.search);
  let edition = params.get('edition') || 'boy';
  const hidden = document.getElementById('selectedEdition');
  const img = document.getElementById('summaryImage');
  const title = document.getElementById('summaryTitle');
  const mini = document.querySelectorAll('.mini-switch');
  function apply(ed){
    edition = ed;
    if (hidden) hidden.value = ed;
    if (img) img.src = `${ed}-1.jpg`;
    if (title) title.textContent = `AI PET – ${ed.charAt(0).toUpperCase()+ed.slice(1)} Edition`;
    mini.forEach(btn => btn.classList.toggle('active', btn.dataset.edition===ed));
  }
  mini.forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.edition)));
  apply(edition);
  const form = document.querySelector('.checkout-form');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      window.location.href = `success.html?edition=${edition}`;
    });
  }
}

function setupSuccess(){
  const params = new URLSearchParams(window.location.search);
  const edition = params.get('edition') || 'boy';
  const img = document.getElementById('successSummaryImage');
  const title = document.getElementById('successSummaryTitle');
  if (img) img.src = `${edition}-1.jpg`;
  if (title) title.textContent = `AI PET – ${edition.charAt(0).toUpperCase()+edition.slice(1)} Edition`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  if (document.getElementById('thumbColumn')) setupLanding();
  if (document.querySelector('.checkout-form')) setupCheckout();
  if (document.getElementById('successSummaryImage')) setupSuccess();
});
