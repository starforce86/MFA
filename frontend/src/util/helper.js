const trackPageView = (url) => {
    try {
        window.gtag('config', 'UA-144912865-1', {
            page_location: url
        });
    } catch (error) {
        // silences the error in dev mode
        // and/or if gtag fails to load
    }
}

export default trackPageView;