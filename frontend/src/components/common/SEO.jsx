import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({
  title,
  description,
  keywords,
  image = 'https://market.xonteam.uz/logo.png',
  type = 'website',
  schemaData = null,
}) => {
  const location = useLocation();
  const currentUrl = `https://market.xonteam.uz${location.pathname}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title ? `${title} | XonTeam Market` : 'XonTeam Market — Smart Devices & Electronics'}</title>
      <meta name="description" content={description || "XonTeam Market — IoT, Arduino, ESP32, Raspberry Pi. Professional elektronika do'koni."} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title || 'XonTeam Market'} />
      <meta property="og:description" content={description || "XonTeam Market — IoT, Arduino, ESP32, Raspberry Pi."} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title || 'XonTeam Market'} />
      <meta name="twitter:description" content={description || "XonTeam Market — IoT, Arduino, ESP32, Raspberry Pi."} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
