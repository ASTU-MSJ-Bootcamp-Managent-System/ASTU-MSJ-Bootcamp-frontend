import OverviewScreen from "./OverviewScreen";
import PeopleScreen from "./PeopleScreen";
import AttendanceScreen from "./AttendanceScreen";
import AssignmentsScreen from "./AssignmentsScreen";
import NewsScreen from "./NewsScreen";
import BatchesScreen from "./BatchesScreen";
import LearningScreen from "./LearningScreen";
import EnrollmentRequestsScreen from "./EnrollmentRequestsScreen";
import ProfileScreen from "./ProfileScreen";

const screens = {
  Overview: OverviewScreen,
  People: PeopleScreen,
  Students: PeopleScreen,
  "Enrollment requests": EnrollmentRequestsScreen,
  Attendance: AttendanceScreen,
  Assignments: AssignmentsScreen,
  Announcements: NewsScreen,
  Batches: BatchesScreen,
  "My learning": LearningScreen,
  Progress: LearningScreen,
  Profile: ProfileScreen,
};

export default function ScreenRouter(p) {
  const Screen = screens[p.active] || OverviewScreen;
  return <Screen {...p} />;
}
