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
      style: 'zp' };

  },
  computed: {
    circles() {
      const i_f = parseInt(this.focal_length, 10);
      const i_n = parseInt(this.number_of_zones, 10);
      const i_w = parseInt(this.wavelength, 10);
      const i_pc = parseInt(this.point_mul_coeff, 10);
      const i_margin = parseInt(this.point_mul_margin, 10) / 10;
      const c = new Array(i_n).fill(1);
      const diams = c.map((_, i) => {
        return 2 * Math.sqrt(i_f * i * (i_w / 1000));
      }).reverse();
      if (this.style === 'zp') {
        return diams;
      } else {
        const dr = diams;
        let d_sum = 0;
        return dr.map((d, i) => {
          if (i === 0) return [{ dx: 0, dy: 0, d: d / 2 * i_margin }];
          const num_points = Math.floor(i_pc / 10 * i);
          const theta = Math.PI * 2 / num_points;
          const offset = !this.point_off_rand ? 0 : Math.random() * Math.PI;
          d_sum += d;
          return new Array(num_points).fill(1).map((_, i) =>
          {
            return {
              dx: d_sum * Math.cos(theta * i + offset),
              dy: d_sum * Math.sin(theta * i + offset),
              d: d / 2 * i_margin };

          });
        });
      }
    } },

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
    <svg style="width: 600px;height:600px;background: grey;" viewBox="0 0 400 400">
    <rect style="fill: none; stroke: red;stroke-width:0.25" x="20" y="20" width="360" height="360"/>
    <g v-if="style === 'zp'">
      <circle v-for="(c, i) in circles" cx="200" cy="200" :r="c" :style="{fill: i % 2 == 0 ? 'white' : 'black'}"/>
     </g>
     <g v-else>
       <g v-for="(c, i) in circles">
         <circle v-for="(b, j) in c"
                style="fill: black"
                :cx="200 + b.dx"
                :cy="200 + b.dy"
                :r="b.d"/>
       </g>
     </g>
    </svg>
    <p>
    Le rectangle rouge représente 3,60*3,60mm sur le fichier final. 
    </p>
  </div>
  </div>
  ` });