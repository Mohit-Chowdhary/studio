
"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface GeneratedSlide {
  text: string;
  imageUrl: string;
}

export function SlideshowCarousel({ slides }: { slides: GeneratedSlide[] }) {
    if (!slides || slides.length === 0) {
        return <p className="text-muted-foreground">No slides were generated.</p>;
    }

    return (
        <Carousel className="w-full max-w-xl mx-auto">
            <CarouselContent>
            {slides.map((slide, index) => (
                <CarouselItem key={index} className="flex flex-col items-center text-center">
                <div className="p-1 space-y-4">
                    {slide.imageUrl ? (
                    <Image
                        src={slide.imageUrl}
                        alt={`Slide ${index + 1} visual`}
                        width={512}
                        height={512}
                        className="rounded-lg shadow-md aspect-square object-cover mx-auto"
                        data-ai-hint="slideshow illustration"
                    />
                    ) : (
                    <div className="w-full max-w-[512px] aspect-square bg-muted rounded-lg flex items-center justify-center p-4">
                        <p className="text-muted-foreground text-center">Image could not be generated for this slide.</p>
                    </div>
                    )}
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap pt-4">
                    <p>{slide.text}</p>
                    </div>
                </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}
