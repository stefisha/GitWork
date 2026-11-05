import React, { useState, useEffect } from 'react';

const FeeInfo = ({ amount, currency = 'USDC', showDetailed = false }) => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeInfo = async () => {
      try {
        if (amount) {
          const response = await fetch(`/api/fees/calculate?amount=${amount}&currency=${currency}`);
          const data = await response.json();
          setFeeData(data);
        } else {
          const response = await fetch('/api/fees/info');
          const data = await response.json();
          setFeeData(data);
        }
      } catch (error) {
        console.error('Failed to fetch fee info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeInfo();
  }, [amount, currency]);

  if (loading) {
    return <span className="text-gray-400">Loading...</span>;
  }

  if (!feeData) {
    return null;
  }

  if (showDetailed && amount) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Bounty Amount:</span>
          <span className="text-white font-medium">{feeData.totalAmount} {feeData.currency}</span>
        </div>
        
        {feeData.showFee ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform Fee ({feeData.feePercentage}%):</span>
              <span className="text-gray-400">- {feeData.feeAmount}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: '#30363d' }}>
              <span className="text-white font-medium">You'll Receive:</span>
              <span className="text-white font-medium">{feeData.displayAmount}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-green-400">✨ {feeData.text}</span>
            <span className="text-white font-medium">{feeData.displayAmount}</span>
          </div>
        )}
      </div>
    );
  }

  // Simple inline display
  return (
    <span className={feeData.isAlpha ? 'text-green-400' : 'text-gray-400'}>
      {feeData.text}
      {feeData.showFee && amount && ` (You'll receive: ${feeData.displayAmount})`}
    </span>
  );
};

export default FeeInfo;

