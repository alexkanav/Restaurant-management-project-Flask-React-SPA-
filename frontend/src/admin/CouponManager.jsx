import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import CouponForm from './CouponForm';
import { Spinner } from '../components';


export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const { data } = await sendToServer('/admin/api/coupons', null, 'GET');
        setCoupons(data);
      } catch (error) {
        toast.error(error.message || 'Помилка пошуку купонів');
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [reloadTrigger]);

  const onSubmit = async (coupon_data) => {
    try {
      setLoading(true);
      const { data } = await sendToServer('/admin/api/coupons', coupon_data, 'POST');
      toast.success(data.message || 'Додано новий купон');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(error.message || 'Помилка створення купона');
    } finally {
      setLoading(false);
    }
  };

  const deactivateCoupon = async (id) => {
    try {
      setLoading(true);
      const { data } = await sendToServer(`/admin/api/coupons/${id}`, null, 'DELETE');
      toast.success(data.message || 'Купон деактивовано');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(error.message || 'Помилка деактивації купона');
    } finally {
      setLoading(false);
    }
  };

  return (
    loading
      ? <Spinner />
      : <CouponForm
          onSubmit={onSubmit}
          coupons={coupons}
          deactivateCoupon={deactivateCoupon}
        />
  );
}
