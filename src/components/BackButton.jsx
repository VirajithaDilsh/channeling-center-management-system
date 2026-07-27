import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const BackButton = ({ onClick, to, sx = {} }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick();
    if (to) return navigate(to);
    navigate(-1);
  };

  return (
    <IconButton
      onClick={handleClick}
      aria-label="Go back"
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: "#e0f2fe",
        "&:hover": { backgroundColor: "#bae6fd" },
        ...sx,
      }}
    >
      <ArrowBackIcon color="primary" />
    </IconButton>
  );
};

export default BackButton;
