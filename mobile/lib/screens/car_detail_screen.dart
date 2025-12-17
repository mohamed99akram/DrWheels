import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class CarDetailScreen extends StatefulWidget {
  final String carId;

  const CarDetailScreen({super.key, required this.carId});

  @override
  State<CarDetailScreen> createState() => _CarDetailScreenState();
}

class _CarDetailScreenState extends State<CarDetailScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _car;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCar();
  }

  Future<void> _fetchCar() async {
    try {
      final response = await _api.get('/cars/${widget.carId}');
      if (response.statusCode == 200) {
        setState(() {
          _car = jsonDecode(response.body);
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Car Details')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _car == null
              ? const Center(child: Text('Car not found'))
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_car!['make']} ${_car!['model']} ${_car!['year']}',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Price: \$${_car!['price']?.toString() ?? '0'}',
                        style: const TextStyle(
                          fontSize: 20,
                          color: Colors.blue,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text('Mileage: ${_car!['mileage']?.toString() ?? '0'} miles'),
                      if (_car!['color'] != null && _car!['color'].toString().isNotEmpty)
                        Text('Color: ${_car!['color']}'),
                      if (_car!['description'] != null && _car!['description'].toString().isNotEmpty) ...[
                        const SizedBox(height: 16),
                        const Text(
                          'Description:',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(_car!['description']),
                      ],
                    ],
                  ),
                ),
    );
  }
}
