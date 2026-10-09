package com.campusplacement.service;

import com.campusplacement.dto.InterviewScheduleRequest;
import com.campusplacement.dto.InterviewResponse;
import java.util.List;

public interface InterviewService {
    InterviewResponse scheduleInterview(String recruiterEmail, InterviewScheduleRequest request);
    List<InterviewResponse> getInterviewsByStudent(String studentEmail);
    List<InterviewResponse> getInterviewsByRecruiter(String recruiterEmail);
    InterviewResponse updateInterviewFeedback(Long interviewId, String feedbackNotes);
}
