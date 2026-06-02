package com.enterprisepm.service;

import com.enterprisepm.dto.ComplaintDTO;
import com.enterprisepm.model.Complaint;
import com.enterprisepm.model.ComplaintStatus;
import com.enterprisepm.model.ComplaintType;
import com.enterprisepm.model.User;
import com.enterprisepm.repository.ComplaintRepository;
import com.enterprisepm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public List<ComplaintDTO> getAllComplaints() {
        return complaintRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ComplaintDTO> getComplaintsByUser(Long userId) {
        return complaintRepository.findByRaisedById(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ComplaintDTO create(ComplaintDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Complaint complaint = new Complaint();
        complaint.setTitle(dto.getTitle());
        complaint.setDescription(dto.getDescription());
        complaint.setType(ComplaintType.valueOf(dto.getType() != null ? dto.getType() : "COMPLAINT"));
        complaint.setStatus(ComplaintStatus.OPEN);
        complaint.setRaisedBy(user);
        return toDTO(complaintRepository.save(complaint));
    }

    public ComplaintDTO updateStatus(Long id, String status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus(ComplaintStatus.valueOf(status.toUpperCase()));
        return toDTO(complaintRepository.save(complaint));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    private ComplaintDTO toDTO(Complaint c) {
        ComplaintDTO dto = new ComplaintDTO();
        dto.setId(c.getId());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setType(c.getType().name());
        dto.setStatus(c.getStatus().name());
        dto.setCreatedAt(c.getCreatedAt());
        if (c.getRaisedBy() != null) {
            dto.setRaisedById(c.getRaisedBy().getId());
            dto.setRaisedByName(c.getRaisedBy().getName());
        }
        return dto;
    }
}
