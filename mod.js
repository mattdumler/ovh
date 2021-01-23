import { sha1 } from "./deps.js";

/** Construct an OVH API HTTP client.
 *
 * @class OVH
 * @param {object} app - API application credentials.
 * @param {string} app.key - Application key token.
 * @param {string} app.secret - Application secret token.
 * @param {string} [consumer] - OVH consumer token.
 *
 * @property {string} consumer - OVH consumer token.
 */
export default class OVH {
  #app;
  #consumer;
  #url;
  constructor({ key, secret }, consumer) {
    this.#app = { key, secret };
    this.#consumer = consumer;
    this.#url = "https://api.us.ovhcloud.com/1.0"; 
  }

  /* Get the current Unix epoch time. */
  static get now() {
    return Math.round(Date.now() / 1000);
  }

  /* Get the client's consumer token. */
  get consumer() {
    return this.#consumer;
  }

  /* Set the client's consumer token. */
  set consumer(token) {
    this.#consumer = token;
  }

  /** Make a Fetch request to the specified endpoint of the OVH API.
   * @memberOf OVH
   * 
   * @async
   * @method request
   *
   * @param {string} endpoint - The OVH API endpoint to request.
   * @param {string} method - The HTTP method of the request.
   * @param {object} [body] - A JavaScript object to be converted to JSON, and sent as the request body.
   *
   * @return {object} The HTTP response returned by the API.
   */
  async request(endpoint, method, body) {
    const resource = this.#url + endpoint;

    const time = this.now;

    const headers = {
      "Content-Type":      "application/json",
      "X-Ovh-Application": this.#app.key,
      "X-Ovh-Timestamp":   time
    };

    body = body ? JSON.stringify(body) : "";

    if (this.#consumer) {
      headers["X-Ovh-Consumer"]  = this.#consumer,
      headers["X-Ovh-Signature"] = "$1$" + sha1([
        this.#app.secret,
        this.#consumer,
        method,
        resource,
        body,
        time
      ].join("+"), "utf8", "hex");
    }

    const response = await fetch(resource, { method, headers, body });

    return [ response.ok, await response.json() ];
  }

  /** Make a POST request.
   * @memberOf OVH
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
    return await this.request(path, "POST", body);
  }

  /** Make a GET request.
   * @memberOf OVH
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
    return await this.request(path, "GET", body);
  }

  /** Make a PUT request.
   * @memberOf OVH
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
    return await this.request(path, "PUT", body);
  }

  /** Make a DELETE request.
   * @memberOf OVH
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
    return await this.request(path, "DELETE", body);
  }
}

// Object.assign(OVH.prototype, ...);

