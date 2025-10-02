import { toast } from 'react-toastify';
import { sendToServer } from './api';


export const getUserDiscount = async () => {
  try {
    const { data } = await sendToServer('api/users/discount', null, 'GET');
    if (data?.discount !== undefined) {
      return data.discount;
    } else {
      toast.warning("Знижку не знайдено.");
      return 0;
    }
  } catch (error) {
    toast.error("Не вдалося отримати знижку.");
    return 0;
  }
};
