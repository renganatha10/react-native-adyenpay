export class PipoUtil {
  constructor() {
    this.authenticationToken =
      '87FFD9D6D360EED597E55A80C07B0C3DE007854C3691CE8D940DCD11692D2DD4';
    this.applicationId = 13;
    // Get device info from the phone
    //
    this.countryCode = 'NL';
    this.locale = 'EN';
    this.bundleId = 'com.rituals.app.test';
    if (this.bundleId === 'com.rituals.app.test') {
      this.getTestSettings(this.countryCode);
    } else {
      this.getProductionSettings(this.countryCode);
    }
    console.log(
      `[RITUALS:PIPO] countryCode: ${this.countryCode} bundleId: ${
        this.bundleId
      }`
    );
  }
  /**
   *
   *
   * @param {string} countryCode
   * @returns {string}
   * @memberof PipoUtil
   */
  getRestrictedCountryCode(countryCode) {
    switch (countryCode) {
      case 'AT':
        return 'AT';
      case 'BE':
        return 'BE';
      case 'DK':
        return 'DK';
      case 'FR':
        return 'FR';
      case 'DE':
        return 'DE';
      case 'NO':
        return 'NO';
      case 'PT':
        return 'PT';
      case 'PL':
        return 'PL';
      case 'ES':
        return 'ES';
      case 'SE':
        return 'SE';
      case 'CH':
        return 'CH';
      case 'GB':
        return 'GB';
      case 'US':
        return 'US';
      default:
        return 'NL';
    }
  }
  /**
   * Retrieve the EVA Settings based on country code
   * @param {string} countryCode The country code to do the lookup for
   */
  getTestSettings(countryCode) {
    this.endPointURL = 'https://api.test.eva-online.cloud';
    this.applicationId = 13;
    switch (countryCode) {
      case 'AT':
        // TODO: Add Austrian authentication token
        break;
      case 'BE':
        // TODO: Add Belgium authentication token
        break;
      case 'DK':
        // TODO: Add Danish authentication token
        break;
      case 'FR':
        // TODO: Add French authentication token
        break;
      case 'DE':
        this.authenticationToken =
          '370B7EA80B34C12E02B6F87578660032A9E15FEC24FA40981BA4F3A33B30B8EA';
        break;
      case 'NO':
        // TODO: Add Norwegian authentication token
        break;
      case 'PT':
        // TODO: Add Portuguese authentication token
        break;
      case 'PL':
        // TODO: Add Polish authentication token
        break;
      case 'ES':
        // TODO: Add Spanish authentication token
        break;
      case 'SE':
        // TODO: Add Swedish authentication token
        break;
      case 'CH':
        // TODO: Add Tjech authentication token
        break;
      case 'GB':
        this.authenticationToken =
          'DD82FF6115F2D19E2307EA7DAE8584080938BD72BE3E7E96B761264F1ED37CCC';
        break;
      case 'US':
        // TODO: Add United States authentication token
        break;
      default:
        // Default is NL
        //
        this.authenticationToken =
          '87FFD9D6D360EED597E55A80C07B0C3DE007854C3691CE8D940DCD11692D2DD4';
        break;
    }
    return {
      authenticationToken: this.authenticationToken,
      applicationId: this.applicationId,
      bundleId: this.bundleId,
      countryCode: this.countryCode,
      endPointURL: this.endPointURL,
      locale: this.locale,
    };
  }
  /**
   * Retrieve the EVA Settings based on country code
   * @param {string} countryCode The country code to do the lookup for
   */
  getProductionSettings(countryCode) {
    this.endPointURL = 'https://eva.rituals.com';
    this.applicationId = 1;
    switch (countryCode) {
      case 'AT':
        // TODO: Add Austrian authentication token
        break;
      case 'BE':
        // TODO: Add Belgium authentication token
        break;
      case 'DK':
        // TODO: Add Danish authentication token
        break;
      case 'FR':
        // TODO: Add French authentication token
        break;
      case 'DE':
        // TODO: Add German authentication token
        break;
      case 'NO':
        // TODO: Add Norwegian authentication token
        break;
      case 'PT':
        // TODO: Add Portuguese authentication token
        break;
      case 'PL':
        // TODO: Add Polish authentication token
        break;
      case 'ES':
        // TODO: Add Spanish authentication token
        break;
      case 'SE':
        // TODO: Add Swedish authentication token
        break;
      case 'CH':
        // TODO: Add Tjech authentication token
        break;
      case 'GB':
        // TODO: Add Great Brittain authentication token
        break;
      case 'US':
        // TODO: Add United States authentication token
        break;
      default:
        // Default is NL
        //
        // TODO: Add Netherlands authentication token
        break;
    }
    return {
      authenticationToken: this.authenticationToken,
      applicationId: this.applicationId,
      bundleId: this.bundleId,
      countryCode: this.countryCode,
      endPointURL: this.endPointURL,
      locale: this.locale,
    };
  }
}
//# sourceMappingURL=PipoUtil.js.map
