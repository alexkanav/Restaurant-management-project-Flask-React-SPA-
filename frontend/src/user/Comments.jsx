import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';


export default function Comments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const { data } = await sendToServer('api/get-comments', null, 'GET');
        setData(data);
      } catch (error) {
        toast.error(error.message || "Не вдалося завантажити відгуки.");
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  return (
    <div id="comments">
      {loading ? (
        <div className="comments-loading">Завантаження відгуків...</div>
      ) : data.length === 0 ? (
        <div className="comments-empty">Ще немає відгуків.</div>
      ) : (
        data.map((item, index) => (
          <div className="card-wrap" key={item.id || index}>
            <div className="main-block-wrap">
              <div className="card-box">
                <div className="card-cont cont_full">
                  <div className="card-comm">
                    <strong>{item.name}</strong>: <span className="card-note">{item.time}</span>
                  </div>
                  <div className="card-descr">{item.message}</div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
