export const fetchProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return null;
    }
  };

  export const fetchDistricts = async (provinceCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const province = await response.json();
      return province.districts; // Trả về danh sách quận/huyện
    } catch (error) {
      console.error('Error fetching districts:', error);
      return null; // Trả về null nếu có lỗi
    }
  };



export const fetchWards = async (districtCode) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    const district = await response.json();
    return district.wards; // Trả về danh sách xã/phường
  } catch (error) {
    return null; // Trả về null nếu có lỗi
  }
};
  
  
  