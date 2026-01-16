export const calculateBMI = (heightCM, weightKG) => {
    const heightM = heightCM / 100;
    const bmi = weightKG / (heightM * heightM);
    return Number(bmi.toFixed(2));
  };
  
  export const getBMICategory = (bmi) => {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    return "obese";
  };
  