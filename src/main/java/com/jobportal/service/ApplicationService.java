package com.jobportal.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jobportal.model.Application;
import com.jobportal.repository.ApplicationRepository;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    // Get all applications
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> getApplicationsByEmail(String email) {
    return applicationRepository.findByEmail(email);
}

    // Get one application
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id).orElseThrow();
    }

    // Add application
    public Application addApplication(Application application) {
        return applicationRepository.save(application);
    }

    // Delete application
    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    public Application updateStatus(Long id, String status) {
    Application application =
            applicationRepository.findById(id).orElseThrow();

    application.setStatus(status);

    return applicationRepository.save(application);
}
}