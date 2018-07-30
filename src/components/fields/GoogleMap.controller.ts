const jakartaLocation = {
  lat: -6.121435,
  lng: 106.774124,
};
export default {
  props: {
    value: {
      type: Object,
      required: false,
      default() {
        return jakartaLocation;
      },
    },
    name: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      geocoder: new google.maps.Geocoder(),
      center: {
        lat: this.value ? this.value.lat : jakartaLocation.lat,
        lng: this.value ? this.value.lng : jakartaLocation.lng,
      },
      markers: [
        {
          position: {
            lat: this.value ? this.value.lat : jakartaLocation.lat,
            lng: this.value ? this.value.lng : jakartaLocation.lng,
          },
        },
      ],
    };
  },
  watch: {
    value(val) {
      if (val) {
        this.center = {
          lat: val.lat || jakartaLocation.lat,
          lng: val.lng || jakartaLocation.lng,
        };
        this.markers = [
          {
            position: {
              lat: val.lat || jakartaLocation.lat,
              lng: val.lng || jakartaLocation.lng,
            },
          },
        ];
      }
    },
  },
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(val) {
        return this.$emit('input', val);
      },
    },
  },
  methods: {
    async onMarkerDragEnd({ latLng }) {
      if (latLng) {
        const location = {
          lat: latLng.lat(),
          lng: latLng.lng(),
        };

        this.geocoder.geocode(
          {
            location,
          },
          (results, status) => {
            if (status === 'OK') {
              const place = results[0];

              this.model = {
                text: place.formatted_address,
                titleAddress: place.address_components[0].long_name,
                address: place.formatted_address,
                lat: location.lat,
                lng: location.lng,
              };
            }
          },
        );
      }
    },
    async onAutocompleteChange(place) {
      if (place) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        this.model = {
          titleAddress: place.name,
          address: place.formatted_address,
          text: `${place.formatted_address}`,
          lat: location.lat,
          lng: location.lng,
        };

        this.markers = [{ position: location }];

        this.center = location;
      }
    },
  },
};
