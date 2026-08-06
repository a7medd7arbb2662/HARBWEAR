/* ═══════════════════════════════════════════════════════════
   HARBWEAR™ — product catalog · size guide · coupons · tiers
   ═══════════════════════════════════════════════════════════ */
window.HB_PRODUCTS = [
  { id: 'oversized-tee', name: 'Oversized Tee', cat: 't-shirts', cats: ['oversized', 'new-arrival'], price: 399, img: 'cat-tshirts.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'White'], tag: 'New', desc: 'Heavyweight 240gsm combed cotton. Relaxed drop-shoulder fit with a boxy silhouette — the everyday essential that survives the week.' },
  { id: 'essentials-tee', name: 'Essentials Tee', cat: 't-shirts', cats: ['essentials', 'white'], price: 399, img: 'coll-essentials.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'White', 'Gray'], tag: 'Essentials', desc: 'Classic crew neck in premium cotton. Clean lines, no logos — just a perfect tee cut in Cairo.' },
  { id: 'streetwear-tee', name: 'Streetwear Tee', cat: 't-shirts', cats: ['streetwear', 'black'], price: 449, img: 'coll-streetwear.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black'], desc: 'Urban-cut tee with a printed graphic. Heavy fabric, washed feel, built for the streets.' },
  { id: 'graphic-tee', name: 'Graphic Tee', cat: 't-shirts', cats: ['streetwear'], price: 449, img: 'prod-tee2.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Gray'], desc: 'Bold graphic print on matte black cotton. A statement piece from the streetwear line.' },
  { id: 'classic-white-tee', name: 'Classic White Tee', cat: 't-shirts', cats: ['white', 'essentials'], price: 399, img: 'coll-white.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White'], desc: 'The white tee, perfected. 100% Egyptian cotton, structured collar, never see-through.' },
  { id: 'oversize-hoodie', name: 'Oversize Hoodie', cat: 'hoodies', cats: ['oversized'], price: 899, img: 'cat-hoodies.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Gray', 'White'], tag: 'Best Seller', desc: 'Extra-oversized hoodie in 400gsm fleece. Double-lined hood, dropped shoulders, kangaroo pocket.' },
  { id: 'heavyweight-hoodie', name: 'Heavyweight Hoodie', cat: 'hoodies', cats: ['essentials', 'premium'], price: 899, img: 'hero-hoodie.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Gray'], desc: 'Premium heavyweight fleece that holds its shape. Ribbed cuffs and hem, tonal embroidery.' },
  { id: 'street-hoodie', name: 'Street Hoodie', cat: 'hoodies', cats: ['streetwear'], price: 849, img: 'prod-hoodie2.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Gray'], desc: 'Street-cut hoodie with a relaxed drape. Brushed interior, sturdy double stitching.' },
  { id: 'rooftop-crew', name: 'Rooftop Crewneck', cat: 'sweatshirts', cats: ['streetwear', 'new-arrival'], price: 799, img: 'prod-sweat1.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black'], tag: 'New', desc: 'Crewneck sweatshirt in heavyweight cotton blend. A clean layer for city evenings.' },
  { id: 'city-mood-sweat', name: 'City Mood Sweatshirt', cat: 'sweatshirts', cats: ['essentials'], price: 749, img: 'prod-sweat2.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Gray'], desc: 'Minimal sweatshirt with a subtle moody tone. Brushed back, premium feel.' },
  { id: 'utility-cargo', name: 'Utility Cargo', cat: 'cargo', cats: ['streetwear'], price: 799, img: 'cat-pants.jpg', sizes: ['28', '30', '32', '34', '36', '38', '40'], colors: ['Black'], desc: 'Six-pocket utility cargo in durable ripstop. Tapered leg, adjustable hem, all-day comfort.' },
  { id: 'oversized-cargo', name: 'Oversized Cargo', cat: 'cargo', cats: ['oversized', 'streetwear'], price: 849, img: 'coll-oversized.jpg', sizes: ['28', '30', '32', '34', '36', '38', '40'], colors: ['Black', 'Gray'], desc: 'Wide-leg cargo with an exaggerated silhouette. The oversized statement of the season.' },
  { id: 'slim-jeans', name: 'Slim Black Jeans', cat: 'jeans', cats: ['black', 'new-arrival'], price: 999, img: 'prod-jeans1.jpg', sizes: ['28', '30', '32', '34', '36', '38', '40'], colors: ['Black'], tag: 'New', desc: 'Slim-fit black denim with a clean finish. Stretch weave that moves with you.' },
  { id: 'night-ripped-jeans', name: 'Night Ripped Jeans', cat: 'jeans', cats: ['streetwear', 'black'], price: 1049, img: 'prod-jeans2.jpg', sizes: ['28', '30', '32', '34', '36', '38', '40'], colors: ['Black', 'Gray'], desc: 'Ripped black denim for after-dark looks. Raw hem, urban attitude.' },
  { id: 'runner-shorts', name: 'Runner Shorts', cat: 'shorts', cats: ['essentials', 'new-arrival'], price: 449, img: 'prod-shorts.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Gray'], desc: 'Lightweight athletic shorts with side pockets. Built for the run, made for the summer.' },
  { id: 'air-weave-26', name: "Air Weave '26", cat: 'sneakers', cats: ['limited', 'premium'], price: 1299, img: 'hero-sneaker.jpg', sizes: ['39', '40', '41', '42', '43', '44', '45', '46'], colors: ['White', 'Black'], tag: 'Drop 001', desc: 'Limited drop. Featherlight knit upper, sculpted sole, clean lines. First of the Air Weave series.' },
  { id: 'monarch-sneaker', name: 'Monarch Sneaker', cat: 'sneakers', cats: ['limited'], price: 1199, img: 'prod-sneaker2.jpg', sizes: ['39', '40', '41', '42', '43', '44', '45', '46'], colors: ['Black', 'White'], desc: 'Monochrome sneaker on a classic cupsole. Minimal branding, maximum wear.' },
  { id: 'baseball-cap', name: 'Baseball Cap', cat: 'caps', cats: ['streetwear', 'accessories'], price: 399, img: 'cat-caps.jpg', sizes: ['One Size'], colors: ['Black', 'White', 'Gray'], desc: 'Structured six-panel cap with an embroidered HW monogram. Adjustable strap.' },
  { id: 'midnight-cap', name: 'Midnight Cap', cat: 'caps', cats: ['streetwear', 'black', 'accessories'], price: 349, img: 'prod-cap2.jpg', sizes: ['One Size'], colors: ['Black'], desc: 'Low-profile cap in matte black. Subtle branding, everyday wear.' },
  { id: 'shadow-cap', name: 'Shadow Cap', cat: 'caps', cats: ['black', 'accessories'], price: 349, img: 'prod-cap3.jpg', sizes: ['One Size'], colors: ['Black'], desc: 'The quiet one — tonal black on black. For days you want to disappear.' },
  { id: 'leather-tote', name: 'Leather Tote', cat: 'bags', cats: ['premium', 'black', 'accessories'], price: 1499, img: 'prod-bag1.jpg', sizes: ['One Size'], colors: ['Black', 'Brown'], tag: 'Premium', desc: 'Full-grain leather tote. Fits a 16" laptop, built to age beautifully.' },
  { id: 'travel-duffel', name: 'Travel Duffel', cat: 'bags', cats: ['premium', 'accessories'], price: 1799, img: 'prod-bag2.jpg', sizes: ['One Size'], colors: ['Brown', 'Black'], desc: 'Weekend duffel in supple leather. Carry handles, shoulder strap, room for everything.' },
  { id: 'crew-socks', name: 'Crew Socks (3 Pack)', cat: 'socks', cats: ['essentials', 'white', 'accessories'], price: 199, img: 'prod-socks.jpg', sizes: ['One Size'], colors: ['White', 'Black'], desc: 'Three pairs of heavyweight crew socks. Reinforced heel and toe.' },
  { id: 'no-show-socks', name: 'No-Show Socks (5 Pack)', cat: 'socks', cats: ['white', 'essentials', 'accessories'], price: 199, img: 'cat-accessories.jpg', sizes: ['One Size'], colors: ['White', 'Black'], desc: 'Five pairs of invisible socks with stay-put silicone grips.' }
];

window.HB_SIZE_GUIDE = {
  tops: {
    title: 'Tops — Size Guide (cm)',
    rows: [
      ['Size', 'Chest', 'Length', 'Sleeve'],
      ['S', '96', '68', '22'],
      ['M', '101', '70', '23'],
      ['L', '106', '72', '24'],
      ['XL', '111', '74', '25'],
      ['XXL', '116', '76', '26']
    ]
  },
  bottoms: {
    title: 'Bottoms — Size Guide',
    rows: [
      ['Size', 'Waist (in)', 'Inseam (cm)'],
      ['28', '28', '74'],
      ['30', '30', '76'],
      ['32', '32', '78'],
      ['34', '34', '80'],
      ['36', '36', '82'],
      ['38', '38', '84'],
      ['40', '40', '86']
    ]
  },
  shoes: {
    title: 'Sneakers — Size Guide (EU)',
    rows: [
      ['EU', '39', '40', '41', '42', '43', '44', '45', '46'],
      ['US', '6.5', '7', '8', '8.5', '9.5', '10', '11', '12'],
      ['UK', '5.5', '6', '7', '7.5', '8.5', '9', '10', '11']
    ]
  },
  one: {
    title: 'One Size',
    rows: [
      ['Item', 'Fits'],
      ['Caps', '54–60 cm head'],
      ['Socks', 'EU 39–46'],
      ['Bags', 'Universal']
    ]
  }
};

window.HB_COUPONS = {
  HARB10: { label: 'HARB10', type: 'percent', value: 10 },
  WELCOME50: { label: 'WELCOME50', type: 'fixed', value: 50 },
  DROP100: { label: 'DROP100', type: 'fixed', value: 100 }
};

window.HB_TIERS = [
  { name: 'Bronze', min: 0, mult: 1, perk: '1 pt per EGP 10' },
  { name: 'Silver', min: 1000, mult: 1.25, perk: '1.25 pts per EGP 10 · early access' },
  { name: 'Gold', min: 2500, mult: 1.5, perk: '1.5 pts per EGP 10 · free express shipping' },
  { name: 'Elite', min: 5000, mult: 2, perk: '2 pts per EGP 10 · priority drops' }
];
