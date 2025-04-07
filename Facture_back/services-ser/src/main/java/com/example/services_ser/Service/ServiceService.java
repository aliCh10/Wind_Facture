package com.example.services_ser.Service;
import com.example.services_ser.Repository.ServiceRepository;
import com.example.services_ser.model.Service;
import lombok.AllArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service // Ajout de cette annotation
@AllArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public Service createService(Service service) {
        return serviceRepository.save(service);
    }

    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public Optional<Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    @Transactional
    public Service updateService(Long id, Service serviceDetails) {
        Service service = serviceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));

        service.setRef(serviceDetails.getRef());
        service.setServiceQuantity(serviceDetails.getServiceQuantity());
        service.setServiceName(serviceDetails.getServiceName());
        service.setServicePrice(serviceDetails.getServicePrice());

        return service;
    }

    @Transactional
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new RuntimeException("Service not found with id: " + id);
        }
        serviceRepository.deleteById(id);
    }
}