import React, { useRef } from "react";
import { Certificate } from "../../types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface CertificateDisplayProps {
  certificate: Certificate;
  userName: string;
  onClose?: () => void;
}

const CertificateDisplay: React.FC<CertificateDisplayProps> = ({
  certificate,
  userName,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#151823", // Dark blue background matching the modal
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${userName}-${certificate.language}-certificate.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full p-6 relative border-2 border-purple-500">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Certificate Preview - Updated for better PDF generation */}
        <div
          ref={certificateRef}
          className="bg-[#151823] rounded-lg border-2 border-purple-500 shadow-2xl relative overflow-hidden p-10"
        >
          {/* Top logo and title */}
          <div className="text-center relative z-10">
            <div className="text-xl text-purple-400 font-semibold mb-2">
              CodeQuest
            </div>
            <div className="h-6 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 mb-6"></div>

            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              Certificate of Achievement
            </h1>
            <div className="h-1 w-64 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-12"></div>
          </div>

          {/* Certificate content */}
          <div className="text-center text-white">
            <p className="text-xl mb-4">This certifies that</p>
            <p className="text-4xl font-bold mb-4">{userName}</p>
            <p className="text-xl mb-2">
              has successfully completed all challenges in
            </p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase mb-12">
              {certificate.language}
            </p>

            <p className="text-gray-400 mb-1">
              Awarded on {formatDate(certificate.earnedAt)}
            </p>
            <p className="text-sm text-gray-500 mb-10">
              Certificate ID: {certificate._id}
            </p>

            {/* Certificate seal */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 relative">
                <svg
                  className="absolute inset-0 w-full h-full text-purple-600"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Background elements */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-purple-600/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full -ml-20 -mb-20"></div>
        </div>

        {/* Download button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={downloadAsPDF}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg shadow-purple-900/30 font-medium"
          >
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateDisplay;
