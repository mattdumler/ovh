import { sha1 } from "./deps.js";

const defaultSubsidiary = "US";

/** Create an OVH API HTTP client.
 *
 * @class API
 * @param {object} app - API application credentials.
 * @param {string} app.key - Application key token.
 * @param {string} app.secret - Application secret token.
 *
 * @property {string} consumer - OVH consumer token.
 */
export default class OVH {

  #key = undefined;
  #secret = undefined;
  #consumer = undefined;

  /* Get the current Unix epoch time. */
  static get now() {
    return Math.round(Date.now() / 1000);
  }

  /* Construct an instance with an application key and secret. */
  constructor({ key, secret }) {
    this.#key = key;
    this.#secret = secret;
  }

  /* Set the instance's consumer token. */
  set consumer(token) {
    this.#consumer = token;
  }

  /* Get the instance's consumer token. */
  set consumer(token) {
    this.#consumer = token;
  }

  /** Make a Fetch request to the specified endpoint of the OVH API.
   * @memberOf API
   *
   * @async
   * @method request
   *
   * @param {string} method - The HTTP method of the request.
   * @param {string} endpoint - The OVH API endpoint to request.
   * @param {object} [body] - A JavaScript object to be converted to JSON, and sent as the request body.
   *
   * @return {object} The HTTP response returned by the API.
   */
  async call(method, path, body) {
    const url = "https://api.us.ovhcloud.com/1.0" + path; 
    const timestamp = Math.round(Date.now() / 1000);
    const headers = {
      "Content-Type": "application/json",
      "X-Ovh-Timestamp": timestamp,
      "X-Ovh-Application": this.#key
    };

    body = body ? JSON.stringify(body) : undefined;

    if (this.#consumer) {
      headers["X-Ovh-Consumer"] = this.#consumer,
      headers["X-Ovh-Signature"] = "$1$" + sha1([
        this.#secret,
        this.#consumer,
        method,
        url,
        body,
        timestamp
      ].join("+"), "utf8", "hex");
    }

    const response = await fetch(url, { method, headers, body });

    return await response;
  }

  /** Make a GET request.
   * @memberOf API
   *
   * @async
   * @method get
   *
   * @param {string} endpoint - The OVH API endpoint to request.
   * @param {object} [body] - A JavaScript object to be converted to JSON, and sent as the request body.
   *
   * @return {object} The HTTP response returned by the API.
   */
  async get(path, body) {
    return await this.call("GET", path, body);
  }

  /** Make a POST request.
   * @memberOf API
   *
   * @async
   * @method post
   *
   * @param {string} endpoint - The OVH API endpoint to request.
   * @param {object} [body] - A JavaScript object to be converted to JSON, and sent as the request body.
   *
   * @return {object} The HTTP response returned by the API.
   */
  async post(path, body) {
    return await this.call("POST", path, body);
  }

  /** Make a PUT request.
   * @memberOf API
   *
   * @async
   * @method put
   *
   * @param {string} endpoint - The OVH API endpoint to request.
   * @param {object} [body] - A JavaScript object to be converted to JSON, and sent as the request body.
   *
   * @return {object} The HTTP response returned by the API.
   */
  async put(path, body) {
    return await this.call("PUT", path, body);
  }

  /** Make a DELETE request.
   * @memberOf API
   *
   * @async
   * @method del
   *
   * @param {string} endpoint - The OVH API endpoint to request.
   * @param {object} [body] - A JavaScript object to be converted to JSON, and sent as the request body.
   *
   * @return {object} The HTTP response returned by the API.
   */
  async del(path, body) {
    return await this.call("DELETE", path, body);
  }

  /*
   * Methods for calling the OVH API '/auth' endpoints.
   */

  /** Request a new consumer credential.
   * @memberOf API
   *
   * @async
   * @method login
   *
   * @param {object} options
   * @param {object[]} options.accessRules - Access rules for the new credential.
   * @param {string} options.accessRules[].method - HTTP method to allow.
   * @param {string} options.accessRules[].path - Route to allow the HTTP method on.
   * @param {string} [options.redirection] - URL to redirect to after the consumer authenticates.
   *
   * @returns {object} response - HTTP response.
   */
  async login(accessRules, redirection) {
    return await this.post("/auth/credential", { accessRules, redirection });
  }

  /** Invalidate the current credential.
   * @memberOf API
   *
   * @async
   * @method logout
   *
   * @returns {object} response - HTTP response.
   */
  async logout() {
    return await this.post("/auth/logout");
  }

  /** Get information about the current credential.
   * @memberOf API
   *
   * @async
   * @method credentials
   *
   * @returns {object} response - HTTP response.
   */
  async credentials() {
    return await this.get("/auth/currentCredential");
  }

  /** Get metadata about the current credential.
   * @memberOf API
   *
   * @async
   * @method authentication
   *
   * @returns {object} response - HTTP response.
   */
  async authentication() {
    return await this.get("/auth/details");
  }

  /** Get the current epoch time of OVH servers.
   * @memberOf API
   *
   * @async
   * @method time
   *
   * @returns {object} response - HTTP response.
   */
  async time() {
    return await this.get("/auth/time");
  }

  /*
   * Methods for calling the OVH API '/me' endpoints.
   */

  /** ...
   * @memberOf API
   *
   * @async
   * @method me
   */
  async me() {
    return await this.get("/me");
  }

  async pay(order, payment) {
    return await this.post(`/me/order/${order}/pay`, { paymentMethod: { id: payment } });
  }

  async newCart(description, expire, ovhSubsidiary = defaultSubsidiary) {
    return await this.post("/order/cart", { description, expire, ovhSubsidiary });
  }

  async assignCart(cart) {
    return await this.post(`/order/cart/${cart}/assign`);
  }

  /** addServerToCart
   * @memberOf API
   *
   * @async
   * @method addServerToCart
   */
  async addServerToCart(cart, planCode, quantity = 1, duration = "P1M", pricingMode = "default") {
    return await this.post(`/order/cart/${cart}/baremetalServers`, {
      planCode,
      quantity,
      duration,
      pricingMode
    });
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method addOptionToItem
   */
  async addOptionToItem(cart, item, planCode, quantity = 1, duration = "P1M", pricingMode = "default") {
    return await this.post(`/order/cart/${cart}/baremetalServers/options`, {
      itemId: item,
      planCode,
      quantity,
      duration,
      pricingMode
    });
  }

  async checkout(cart) {
    return await this.post(`/order/cart/${cart}/checkout`);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getMeApiApplication
   */
  async getMeApiApplication() {
    const url = "/me/api/application";
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getMeApiApplicationId
   */
  async getMeApiApplicationId(appId) {
    const url = "/me/api/application/" + appId;
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method delMeApiApplicationId
   */
  async delMeApiApplicationId(appId) {
    const url = "/me/api/application/" + appId;
    return await this.del(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getMeOrder
   */
  async getMeOrder() {
    const url = "/me/order";
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getMeOrderId
   */
  async getMeOrderId(orderId) {
    const url = "/me/order/" + orderId;
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method postMeOrderIdPay
   */
  async postMeOrderIdPay(orderId, { id }) {
    const url = "/me/order/" + orderId + "/pay";
    const body = { paymentMethod: { id } };
    return await this.post(url, body);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getMeOrderIdPaymentMethods
   */
  async getMeOrderIdPaymentMethods(orderId) {
    const url = "/me/order/" + orderId + "/paymentMethods";
    return await this.get(url);
  }



  /*
   * Methods for calling the OVH API '/order' endpoints.
   */

  /** ...
   * @memberOf API
   *
   * @async
   * @method getOrderCart
   */
  async getOrderCart({ description } = {}) {
    const url = "/cart";
    const body = { description };
    return await this.get(url, body);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method postOrderCart
   */
  async postOrderCart({ ovhSubsidiary, description, expire } = {}) {
    const url = "/cart";
    const body = { ovhSubsidiary, description, expire };
    return await this.post(url, body);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method delOrderCartId
   */
  async delOrderCartId(cartId) {
    const url = "/cart/" + cartId;
    return await this.del(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getOrderCartId
   */
  async getOrderCartId(cartId) {
    const url = "/cart/" + cartId;
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method putOrderCartId
   */
  async putOrderCartId(cartId, { ovhSubsidiary, description, expire } = {}) {
    const url = "/cart/" + cartId;
    const body = { ovhSubsidiary, description, expire };
    return await this.put(url, body);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method postOrderCartIdAssign
   */
  async postOrderCartIdAssign(cartId) {
    const url = "/cart/" + cartId + "/assign";
    return await this.post(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getOrderCartIdBaremetalServers
   */
  async getOrderCartIdBaremetalServers(cartId) {
    const url = "/cart/" + cartId + "/baremetalServers";
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getOrderCartIdBaremetalServersOptions
   */
  async getOrderCartIdBaremetalServersOptions(cartId, planCode) {
    const url = "/cart/" + cartId + "/baremetalServers/options?planCode=" + planCode;
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method postOrderCartIdVrack
   */
  async postOrderCartIdVrack(cartId, { quantity, duration, pricingMode } = {}) {
    const url = "/cart/" + cartId + "/vrack";
    const body = { planCode: "vrack" , quantity, duration, pricingMode };
    return await this.post(url, body);
  }



  /*
   * Methods for calling the OVH API '/dedicate/server' endpoints.
   */

  /** Retrieve a list of the consumers dedicated servers' names. This information
   * is fetched by making an HTTP GET request to the '/dedicated/server' endpoint.
   *
   * @summary List the names of the consumer's dedicated servers.
   * @memberOf API
   *
   * @async
   * @function getDedicatedServer
   *
   * @return {string[]} a list of server names.
   */
  async getDedicatedServer() {
    const url = "/dedicated/server";
    return await this.get(url);
  }

  /**  ...
   * @memberOf API
   *
   * @async
   * @method getDedicatedServerAvailabilities
   */
  async getDedicatedServerAvailabilities({ country, hardware } = {}) {
    const url = "/dedicated/server/availabilities";
    const body = { country, hardware };
    return await this.get(url, body);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getDedicatedServerAvailabilitiesRaw
   */
  async getDedicatedServerAvailabilitiesRaw() {
    const url = "/dedicated/server/availabilities/raw";
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getDedicatedServerDatacenterAvailabilities
   */
  async getDedicatedServerDatacenterAvailabilities({ datacenters, excludeDatacenters, memory, server, storage, planCode } = {}) {
    const url = "/dedicated/server/datacenter/availabilities";
    const body = { datacenters, excludeDatacenters, memory, server, storage, planCode };
    return await this.get(url, body);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getDedicatedServerOsAvailabilities
   */
  async getDedicatedServerOsAvailabilities({ hardware } = {}) {
    const url = "/dedicated/server/osAvailabilities";
    const body = { hardware };
    return await this.get(url, body);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getDedicatedServerVirtualNetworkInterfaceUuid
   */
  async getDedicatedServerVirtualNetworkInterfaceUuid(uuid) {
    const url = "/dedicated/server/virtualNetworkInterface/" + uuid;
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method getDedicatedServerName
   */
  async getDedicatedServerName(name) {
    const url = "/dedicated/server/" + name;
    return await this.get(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method putDedicatedServerName
   */
  async putDedicatedServerName(name, { bootId, monitoring, rescueMail, rootDevice, state } = {}) {
    const url = "/dedicated/server/" + name;
    return await this.put(url);
  }

  /** ...
   * @memberOf API
   *
   * @async
   * @method postDedicatedServerNameReboot
   */
  async postDedicatedServerNameReboot(name) {
    const url = "/dedicated/server/" + name + "/reboot";
    return await this.post(url);
  }

  async getAllowedServices(vrack, serviceFamily) {
    return await this.get(`/vrack/${vrack}/allowedServices${serviceFamily ? '?serviceFamily=' + serviceFamily : ''}`);
  }

}

