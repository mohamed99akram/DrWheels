import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'car_detail_screen.dart';
import 'dart:convert';

class CarsScreen extends StatefulWidget {
  const CarsScreen({super.key});

  @override
  State<CarsScreen> createState() => _CarsScreenState();
}

class _CarsScreenState extends State<CarsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _cars = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCars();
  }

  Future<void> _fetchCars() async {
    try {
      final response = await _api.get('/cars');
      if (response.statusCode == 200) {
        setState(() {
          _cars = jsonDecode(response.body);
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
      appBar: AppBar(title: const Text('Cars')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _cars.isEmpty
              ? const Center(child: Text('No cars available'))
              : ListView.builder(
                  itemCount: _cars.length,
                  itemBuilder: (context, index) {
                    final car = _cars[index];
                    return Card(
                      margin: const EdgeInsets.all(8),
                      child: ListTile(
                        title: Text('${car['make']} ${car['model']} ${car['year']}'),
                        subtitle: Text('${car['mileage']?.toString() ?? '0'} miles'),
                        trailing: Text(
                          '\$${car['price']?.toString() ?? '0'}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CarDetailScreen(carId: car['_id']),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
