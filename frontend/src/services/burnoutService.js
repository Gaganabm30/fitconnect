import api from './api';

const getBurnoutStatus = async () => {
    const response = await api.get('/burnout/status');
    return response.data;
};

const evaluateBurnout = async () => {
    const response = await api.post('/burnout/evaluate');
    return response.data;
};

const getRecommendations = async () => {
    const response = await api.get('/burnout/recommendations');
    return response.data;
};

const sendFeedback = async (feedbackType) => {
    const response = await api.post('/burnout/feedback', { feedbackType });
    return response.data;
};

const burnoutService = {
    getBurnoutStatus,
    evaluateBurnout,
    getRecommendations,
    sendFeedback,
};

export default burnoutService;
