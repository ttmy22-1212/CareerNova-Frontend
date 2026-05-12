
import BookIcon from "@mui/icons-material/Book";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ArticleIcon from "@mui/icons-material/Article";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import FolderIcon from "@mui/icons-material/Folder";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export const getResourceIcon = (type: string) => {
    switch (type) {
      case "Course":
        return <SchoolIcon />;
      case "Video":
        return <VideoLibraryIcon />;
      case "Book":
        return <BookIcon />;
      case "Article":
        return <ArticleIcon />;
      case "Project":
        return <WorkIcon />;
      case "Interview":
        return <QuestionAnswerIcon />;
      case "Resource":
        return <FolderIcon />;
      default:
        return <MoreHorizIcon />;
    }
  };