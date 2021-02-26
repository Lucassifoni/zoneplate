const vm = new Vue({
  el: "#app",
  data() {
    return {
      focal_length: 25,
      number_of_zones: 5,
      point_mul_coeff: 31,
      point_mul_margin: 9,
      point_off_rand: true,
      wavelength: 550,
      style: 'zp'
    };

  },
  computed: {
    circles() {
      const i_f = parseInt(this.focal_length, 10);
      const i_n = parseInt(this.number_of_zones, 10);
      const i_w = parseInt(this.wavelength, 10);
      const c = new Array((i_n * 2) + 1).fill(1);
      const radiuses = c.map((_, i) => {
        return Math.sqrt(i_f * (i + 1) * (i_w / 1000));
      }).reverse();
      if (this.style === 'zp') {
        return radiuses;
      } else {
        return this.mega_pinhole(radiuses);
      }
    },
    zp_svg() {
      return `<g>
      <rect style="fill: black; stroke: none;" x="20" y="20" width="360" height="360"/>`
        + this.zp_svg_circles
        + `</g>`;
    },
    zp_svg_circles() {
      return this.circles.map((c, i) => {
        return `<circle cx="200" cy="200" r="${c}" style="fill: ${i % 2 == 0 ? 'white' : 'black'}"/>`;
      }).join("");
    },
    mp_svg() {
      return `<g>
      <rect style="fill: black; stroke: none;" x="20" y="20" width="360" height="360"/>
      ` + this.mp_svg_circles +

        + `</g>`
    },
    mp_svg_circles() {
      return this.circles.map((c, i) => {
        return `
        <g> ${c.map((b, j) => `<circle
        style="fill: white"
        cx="${200 - (b.dx)}"
        cy="${200 - (b.dy)}"
        r="${b.d}"/>`).join("")}
        </g>
      `}).filter((_, i) => i % 2 === 0).join("")
    },
    svg() {
      return `<svg style="width: 600px;height:600px;background: grey;" viewBox="0 0 400 400">
      <rect style="fill: none; stroke: red;stroke-width:0.25" x="20" y="20" width="360" height="360"/>`
        + (this.style === 'zp' ? this.zp_svg : this.mp_svg)
        + `</svg>`;
    },
  },
  methods: {
    mega_pinhole(ra) {
      let r = ra.reverse();
      let prev_d = 0;
      const i_pc = parseInt(this.point_mul_coeff, 10);
      const i_margin = parseInt(this.point_mul_margin, 10) / 10;
      let out = [];
      for (let i = 0; i < r.length; i++) {
        const num_points = Math.floor(i_pc / 10 * i) + 1;
        const theta = (Math.PI * 2) / num_points;
        let nd = r[i] - prev_d;
        const of = Math.random() * Math.PI;
        out.push(new Array(num_points).fill(1).map((_, j) => ({
            dx: prev_d * Math.cos(theta * j + of),
            dy: prev_d * Math.sin(theta * j + of),
            d: (nd) * i_margin,
        })));
        prev_d = r[i];
      }
      return out;
    },
    download() {
      const i_f = parseInt(this.focal_length, 10);
      const i_n = parseInt(this.number_of_zones, 10);
      const i_w = parseInt(this.wavelength, 10);
      const i_pc = parseInt(this.point_mul_coeff, 10);
      const i_margin = parseInt(this.point_mul_margin, 10) / 10;
      const svgData = this.svg;
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `${this.style}_${i_f}_${i_n}_${i_w}_${i_pc}_${i_margin}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
  },
  template: `
  <div style="display: flex;">
  <div class="editor" style="flex: 0 0 50%">
    <h3 class="subtitle">Concepteur de ZonePlate & Megapinholes</h3>
    <div class="field">
      <label class="label is-small">Type d'ouverture</label>
      <div class="select is-small">
        <select v-model="style">
          <option :value="'zp'">ZonePlate</option>
          <option :value="'mp'">MegaPinhole</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label class="label is-small">Focale souhaitée (25-250), en mm</label>
      <input type="number" class="input is-small" v-model="focal_length"/>
    </div>
    <div class="field">
      <label class="label is-small">Pour le Megapinhole, coefficient de multiplication du nombre de points</label>
      <input type="number" class="input is-small" v-model="point_mul_coeff"/>
    </div>
    <div class="field">
      <label class="label is-small">Pour le Megapinhole, en 10ièmes, taille de point (1-10)</label>
      <input type="number" class="input is-small" v-model="point_mul_margin"/>
    </div>
    <div class="field">
      <label class="label is-small">Pour le Megapinhole, point de départ aléatoire</label>
      <input type="checkbox" v-model="point_off_rand"/>
    </div>
    <div class="field">
      <label class="label is-small">Nombre de zones (minimum 5)</label>
      <input type="number" class="input is-small" v-model="number_of_zones"/>
    </div>
    <div class="field">
      <label class="label is-small">Longueur d'onde (en nanomètres, 400-800)</label>
      <input type="number" class="input is-small" v-model="wavelength"/>
    </div>
  </div>
  <div class="viewer" style="flex: 0 0 50%; padding-left: 1em;">
    <div v-html="svg"> </div>
    <p>
    Le rectangle rouge représente 36*36mm sur le fichier final. 
    </p>
    <div class="buttons">
      <button class="button is-primary" @click="download">Télécharger</download>
    </div>
  </div>
  </div>
  ` });