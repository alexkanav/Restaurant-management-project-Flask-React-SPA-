import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';


export default function Comments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const comments = await sendToServer('comments', null, 'GET');
        setData(comments);
      } catch {
        toast.error('Не вдалося завантажити відгуки.');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  return (
    <div id="comments">
      <div className="main-block-name">Відгуки наших клієнтів:</div>

      {loading ? (
        <div className="comments-loading">Завантаження відгуків...</div>
      ) : data.length === 0 ? (
        <div className="comments-empty">Ще немає відгуків.</div>
      ) : (
        data.map((item, index) => (
          <div className="card-wrap" key={item.id || index}>
            <div className="card-box">
              <div className="card-cont cont_full">
                <div className="card-comm">
                  <strong>{item.name}</strong>:&nbsp;&nbsp;
                  {item.time}
                </div>
                <div className="card-descr">{item.message}</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
