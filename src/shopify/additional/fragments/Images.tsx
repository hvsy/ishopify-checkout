import {FC, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {FreeMode, Pagination, Thumbs} from "swiper/modules";
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

export type ImageProps = {
    selected: string;
    images: any[];
};

export const Images: FC<ImageProps> = (props) => {
    const {images, selected} = props;
    const [swiper, setSwiper] = useState<any>(null);
    const mobile = window.screen.availWidth <= 640;
    if (images.length < 1) {
        return null;
    }
    if (images.length < 2) {
        return <img src={images?.[0]?.previewImage?.url}/>
    }
    return <div className={'flex flex-col items-stretch w-full max-w-[100vw] overflow-hidden space-y-3'}>
        <Swiper
            modules={[Pagination, Thumbs]}
            thumbs={{
                swiper,
            }}
            spaceBetween={10}
            autoHeight={true}
            centeredSlides={true}
            pagination={{
                enabled: mobile,
                clickable: true,
            }}
            className={'w-full mx-auto max-w-[100vw]'}
            // navigation={true}
            effect={'slide'}
        >
            {images.map((item, i) => {
                const image = item.previewImage;
                return <SwiperSlide key={i} className={'select-none'}>
                    <img className={'max-w-[100vw] w-full object-cover'} src={image.url}
                         alt={image.alt}/>
                </SwiperSlide>
            })}
        </Swiper>
        {!mobile && <Swiper onSwiper={(swiper) => {
            setSwiper(swiper);
        }}
                            className={'w-full mx-auto max-w-[100vw] overflow-hidden thumbs'}
                            loop={false}
                            modules={[Thumbs,FreeMode]}
                            height={80}
                            spaceBetween={10}
                            freeMode={true}
                            breakpoints={{
                                320: {
                                    slidesPerView : 8,
                                    spaceBetween : 5,
                                },
                                480: {
                                    slidesPerView : 8,
                                    spaceBetween : 10,
                                }
                            }}
        >
            {images.map((item, i) => {
                const image = item.previewImage;
                return <SwiperSlide key={i} className={'w-full overflow-hidden'}>
                    <div className={'w-full h-full flex flex-col justify-center items-stretch'}>
                        <div className={'w-auto overflow-hidden min-w-36'}>
                            <img width={80} className={'object-contain overflow-hidden'} src={image.url}
                                 alt={image.alt}/>
                        </div>
                    </div>
                </SwiperSlide>
            })}
        </Swiper>}
    </div>;
};
