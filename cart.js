
const apiUrl = "https://vue3-course-api.hexschool.io";
const apiPath = "ufo060204";

Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const productModal = {
  // 當 id 變動時，取得遠端資料，並呈現 Modal
  props: ["id", "addToCart", "openModal"],
  data() {
    return {
      modal: {},
      tempProduct: {},
      qty: 1,
    };
  },
  template: "#userProductModal",
  watch: {
    id() {
      // id 變動了
      // console.log("productModal:", this.id);
      if (this.id) {
        axios
          .get(`${apiUrl}/v2/api/${apiPath}/product/${this.id}`)
          .then((res) => {
            // console.log("單一產品", res.data.product);
            this.tempProduct = res.data.product;
            this.modal.show();
          })
          .catch((err) => {
            alert(err.data.message);
          });
      }
    },
  },
  methods: {
    hide() {
      this.modal.hide();
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
    // id 的寫法
    // this.modal = new bootstrap.Modal("#productModal");
    // 監聽 DOM，當 Modal 關閉時...要做其他事情
    this.$refs.modal.addEventListener("hidden.bs.modal", (event) => {
      // 改 id
      this.openModal("");
    });
  },
};

const app = Vue.createApp({
  data() {
    return {
      products: [],
      productId: "",
      cart: {},
      loadingItem: "", // 存 id
      form: {
        user: {
          name: '',
          mail: '',
          tel: '',
          address: '',
        },
        message: '',
      },
    };
  },
  methods: {
    getProducts() {
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/products/all`)
        .then((res) => {
          // console.log("產品列表", res.data.products);
          this.products = res.data.products;
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    openModal(id) {
      this.productId = id;
      // console.log("外層帶入 productId", id);
    },
    addToCart(product_id, qty = 1) {
      // 當沒有傳入該參數時，會使用預設值
      const data = {
        product_id,
        qty,
      };
      this.loadingItem = product_id;
      axios
        .post(`${apiUrl}/v2/api/${apiPath}/cart`, { data })
        .then((res) => {
          // console.log("加入購物車", res.data);
          this.$refs.productModal.hide();
          this.getCarts();
          this.loadingItem = "";
          alert(res.data.message);
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    getCarts() {
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/cart`)
        .then((res) => {
          // console.log("購物車", res.data);
          this.cart = res.data.data;
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    updateCartItem(item) {
      // 購物車的 id , 產品的 id
      const data = {
        product_id: item.product.id,
        qty: item.qty,
      };
      this.loadingItem = item.id;
      // console.log(data, item.id);
      axios
        .put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`, { data })
        .then((res) => {
          // console.log("更新購物車", res.data);
          this.getCarts();
          this.loadingItem = "";
          alert(res.data.message);
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    deleteCartItem(item) {
      this.loadingItem = item.id;
      axios
        .delete(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`)
        .then((res) => {
          // console.log("刪除購物車", res.data);
          this.loadingItem = "";
          this.getCarts();
          alert(res.data.message);
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    deleteAllCart() {
      axios
        .delete(`${apiUrl}/v2/api/${apiPath}/carts`)
        .then((res) => {
          // console.log("刪除全部購物車", res.data);
          this.getCarts();
          alert(res.data.message);
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    onSubmit() {
      alert("訂單已送出");
    },
  },
  mounted() {
    this.getProducts();
    this.getCarts();
  },
});

app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.component("productModal", productModal);
app.mount("#app");
