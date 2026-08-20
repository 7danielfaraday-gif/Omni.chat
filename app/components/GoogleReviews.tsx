"use client";

import { useEffect, useState } from "react";

type Review = { author: string; text: string; rating: number };

const fallbackReviews: Review[] = [
  { author: "Conexão Google", text: "Os depoimentos reais aparecerão aqui automaticamente assim que o Perfil da Empresa for conectado.", rating: 0 },
  { author: "Enquanto isso", text: "Confira as avaliações atualizadas diretamente no Google.", rating: 0 },
];

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/reviews")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("reviews unavailable"))))
      .then((data: { reviews?: Review[]; configured?: boolean }) => {
        if (active && data.configured && data.reviews?.length) {
          setReviews(data.reviews);
          setSynced(true);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <div className="google-reviews">
      <div className="google-status">{synced ? "Avaliações atualizadas pelo Google" : "Conexão com o Google pendente"}</div>
      <div className="review-cards">
        {reviews.slice(0, 2).map((review, index) => (
          <article className="review-card" key={`${review.author}-${index}`}>
            <div className="review-stars" aria-label={review.rating ? `${review.rating} de 5 estrelas` : "Fonte Google"}>{review.rating ? "★".repeat(review.rating) : "GOOGLE"}</div>
            <blockquote>“{review.text}”</blockquote>
            <cite>{review.author}</cite>
          </article>
        ))}
      </div>
      <p className="review-source-note">
        A sincronização automática está pronta para conectar ao Perfil da Empresa no Google. Enquanto isso, você pode conferir todas as avaliações diretamente no <a href="https://www.google.com/maps/search/?api=1&query=Amanda+Bergamasco+Massoterapia" target="_blank" rel="noreferrer">Google</a>.
      </p>
    </div>
  );
}
