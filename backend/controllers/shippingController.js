const axios = require('axios');

const RAJAONGKIR_BASE_URL = 'https://api.rajaongkir.com/starter';
const API_KEY = process.env.RAJAONGKIR_API_KEY;

// Get All Provinces
const getProvinces = async (req, res) => {
  try {
    const response = await axios.get(`${RAJAONGKIR_BASE_URL}/province`, {
      headers: { key: API_KEY }
    });

    res.status(200).json({
      success: true,
      data: response.data.rajaongkir.results
    });
  } catch (error) {
    console.error('Get provinces error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data provinsi.'
    });
  }
};

// Get Cities by Province
const getCities = async (req, res) => {
  try {
    const { province_id } = req.query;

    const response = await axios.get(`${RAJAONGKIR_BASE_URL}/city`, {
      headers: { key: API_KEY },
      params: { province: province_id }
    });

    res.status(200).json({
      success: true,
      data: response.data.rajaongkir.results
    });
  } catch (error) {
    console.error('Get cities error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kota.'
    });
  }
};

// Calculate Shipping Cost
const calculateShippingCost = async (req, res) => {
  try {
    const { origin, destination, weight, courier } = req.body;

    // Validasi input
    if (!origin || !destination || !weight || !courier) {
      return res.status(400).json({
        success: false,
        message: 'Origin, destination, weight, dan courier wajib diisi.'
      });
    }

    // RajaOngkir API request
    const response = await axios.post(
      `${RAJAONGKIR_BASE_URL}/cost`,
      {
        origin, // city id origin
        destination, // city id destination
        weight, // in grams
        courier // jne, pos, tiki, etc
      },
      {
        headers: {
          key: API_KEY,
          'content-type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const results = response.data.rajaongkir.results;

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada layanan pengiriman tersedia.'
      });
    }

    // Format response
    const shippingOptions = results[0].costs.map(cost => ({
      service: cost.service,
      description: cost.description,
      cost: cost.cost[0].value,
      etd: cost.cost[0].etd,
      note: cost.cost[0].note
    }));

    res.status(200).json({
      success: true,
      data: {
        courier: results[0].name,
        options: shippingOptions
      }
    });
  } catch (error) {
    console.error('Calculate shipping error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menghitung ongkos kirim.'
    });
  }
};

module.exports = {
  getProvinces,
  getCities,
  calculateShippingCost
};
