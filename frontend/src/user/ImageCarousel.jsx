import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import { carouselImages } from '../../config.json';


export default function ImageCarousel() {

  return (
    <>
      <div className="main-block-name">Наші страви:</div>
      <Carousel
        showThumbs={false}
        autoPlay
        infiniteLoop
        showStatus={false}
      >
        {carouselImages.map((img, index) => (
          <div key={img.link}>
            <img src={`/static/images/${img.link}`} alt={img.alt} loading="lazy" />
            <p className="legend">{img.legend}</p>
          </div>
        ))}
      </Carousel>
    </>
  );
}
