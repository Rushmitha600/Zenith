export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  phone: (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  },
  
  aadhar: (aadhar) => {
    const re = /^[0-9]{12}$/;
    return re.test(aadhar);
  },
  
  pan: (pan) => {
    const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return re.test(pan);
  },
  
  password: (password) => {
    return password.length >= 6;
  },
  
  name: (name) => {
    return name.length >= 2 && name.length <= 50;
  }
};