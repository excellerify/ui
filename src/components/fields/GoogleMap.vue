<template lang="pug">
v-layout(row wrap style="margin-bottom:26px")
  v-flex(xs12 class="input-group" style="padding: 0")
    label {{name}}
    gmap-autocomplete(
      v-if="!readonly"
      :value="model.text"
      placeholder="Choose Location"
      @place_changed="onAutocompleteChange"
      style="width:100%; margin-bottom: 5px; height: 25px;")

    span(v-else) {{model.text}}

  v-flex(xs12 )
    gmap-map(
      :center="center"
      :zoom="12"
      style="width: 100%; height: 200px"
    )
      gmap-marker(
        :key="index"
        v-for="(m, index) in markers"
        :position="m.position"
        :clickable="true"
        :draggable="!readonly"
        @click="center=m.position"
        @dragend="onMarkerDragEnd"
      )
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: false,
      default: {}
    },
    name: {
      type: String,
      required: true
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      geocoder: new google.maps.Geocoder(),
      center: {
        lat: this.value.latitude || -6.121435,
        lng: this.value.longitude || 106.774124
      },
      markers: [
        {
          position: {
            lat: this.value.latitude || -6.121435,
            lng: this.value.longitude || 106.774124
          }
        }
      ]
    };
  },
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(val) {
        return this.$emit("input", val);
      }
    }
  },
  methods: {
    onMarkerDragEnd: async function({ latLng }) {
      if (latLng) {
        const location = {
          lat: latLng.lat(),
          lng: latLng.lng()
        };

        this.geocoder.geocode(
          {
            location
          },
          (results, status) => {
            if (status === "OK") {
              const place = results[0];

              this.model = {
                text: place.formatted_address,
                titleAddress: place.address_components[0].long_name,
                address: place.formatted_address,
                latitude: location.lat,
                longitude: location.lng
              };
            }
          }
        );
      }
    },
    onAutocompleteChange: async function(place) {
      if (place) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        this.model = {
          titleAddress: place.name,
          address: place.formatted_address,
          text: `${place.formatted_address}`,
          latitude: location.lat,
          longitude: location.lng
        };

        this.markers = [{ position: location }];

        this.center = location;
      }
    }
  }
};
</script>