package com.enterprisepm.service;

import com.enterprisepm.model.ProjectFile;
import com.enterprisepm.model.Project;
import com.enterprisepm.model.User;
import com.enterprisepm.repository.ProjectFileRepository;
import com.enterprisepm.repository.ProjectRepository;
import com.enterprisepm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final ProjectFileRepository fileRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ProjectFile upload(MultipartFile file, Long projectId, String uploaderEmail) throws IOException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        ProjectFile projectFile = new ProjectFile();
        projectFile.setFileName(file.getOriginalFilename());
        projectFile.setStoredFileName(storedName);
        projectFile.setFileType(file.getContentType());
        projectFile.setFileSize(file.getSize());
        projectFile.setProject(project);
        projectFile.setUploadedBy(uploader);
        return fileRepository.save(projectFile);
    }

    public List<ProjectFile> getByProject(Long projectId) {
        return fileRepository.findByProjectId(projectId);
    }

    public byte[] download(Long fileId) throws IOException {
        ProjectFile projectFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        Path filePath = Paths.get(uploadDir).resolve(projectFile.getStoredFileName());
        return Files.readAllBytes(filePath);
    }

    public void delete(Long fileId) throws IOException {
        ProjectFile projectFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        Path filePath = Paths.get(uploadDir).resolve(projectFile.getStoredFileName());
        Files.deleteIfExists(filePath);
        fileRepository.deleteById(fileId);
    }
}
