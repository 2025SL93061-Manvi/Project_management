package com.enterprisepm.controller;

import com.enterprisepm.model.ProjectFile;
import com.enterprisepm.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectFile>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(fileStorageService.getByProject(projectId));
    }

    @PostMapping("/upload/{projectId}")
    public ResponseEntity<ProjectFile> upload(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        return ResponseEntity.ok(fileStorageService.upload(file, projectId, userDetails.getUsername()));
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<byte[]> download(@PathVariable Long fileId) throws IOException {
        byte[] data = fileStorageService.download(fileId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"file\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<String> delete(@PathVariable Long fileId) throws IOException {
        fileStorageService.delete(fileId);
        return ResponseEntity.ok("File deleted");
    }
}
