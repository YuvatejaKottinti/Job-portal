package com.jobportal.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jobportal.model.Job;
import com.jobportal.repository.JobRepository;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // Get all jobs
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // Get one job
    public Job getJobById(Long id) {
        return jobRepository.findById(id).orElseThrow();
    }

    // Add job
    public Job addJob(Job job) {
        return jobRepository.save(job);
    }

    // Update job
    public Job updateJob(Long id, Job job) {

        Job existingJob = jobRepository.findById(id).orElseThrow();

        existingJob.setTitle(job.getTitle());
        existingJob.setCompany(job.getCompany());
        existingJob.setLocation(job.getLocation());
        existingJob.setDescription(job.getDescription());
        existingJob.setSkills(job.getSkills());
        existingJob.setSalary(job.getSalary());

        return jobRepository.save(existingJob);
    }

    // Delete job
    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }
}