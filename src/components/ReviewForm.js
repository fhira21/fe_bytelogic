import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating"; // Pastikan path sesuai

const defaultAvatar = "https://www.w3schools.com/howto/img_avatar.png";

const ReviewForm = ({
  profile,
  review,
  hoverRating,
  setHoverRating,
  setReview,
  handleSubmitReview,
}) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <img
          className="h-12 w-12 rounded-full object-cover"
          src={profile.data?.client?.foto_profile || defaultAvatar}
          alt="User avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
        <div>
          <h3 className="text-base font-semibold">
            {profile.data?.user?.username || "-"}
          </h3>
          <p className="text-sm text-gray-600">
            {profile.data?.client?.nama_lengkap || "-"}
          </p>
        </div>
      </div>

      <div>
        {/* <h2 className="text-xl font-semibold mb-4">share your thoughts about the company</h2> */}
        <form onSubmit={handleSubmitReview}>
          <div className="flex justify-center mb-4">
            <StarRating
              rating={review.rating}
              onRatingChange={(rating) =>
                setReview((prev) => ({ ...prev, rating }))
              }
              hoverRating={hoverRating}
              onHoverChange={setHoverRating}
            />
          </div>
          <div className="mb-4">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              value={review.comment}
              onChange={(e) =>
                setReview((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              placeholder="share your thoughts about the company"
            ></textarea>
          </div>
          {review.error && (
            <div className="mb-4 text-red-500">{review.error}</div>
          )}
          {review.success && (
            <div className="mb-4 text-green-500">
              Review berhasil dikirim!
            </div>
          )}
          <div className="mt-4 flex justify-start">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
              disabled={review.submitting}
            >
              {review.submitting ? "Mengirim..." : "Submit Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
